{
  description = "Accessible transit dashboard using transitapp's API";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    nix-deno.url = "github:nekowinston/nix-deno";
  };

  outputs = inputs @ {self, ...}:
    inputs.flake-parts.lib.mkFlake {inherit inputs;} {
      systems = ["x86_64-linux" "x86_64-darwin" "aarch64-linux" "aarch64-darwin"];
      perSystem = {
        system,
        pkgs,
        ...
      }: let
        name = "transit-dashboard";
        lib = pkgs.lib;
      in rec {
        _module.args.pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [inputs.nix-deno.overlays.default];
        };
        devShells.default = pkgs.mkShell {
          inherit name;
          buildInputs = with pkgs; [
            deno
            nvfetcher
          ];
          shellHook = ''
            deno task
          '';
        };
        packages = {
          default = let
            nvfetcher = pkgs.callPackage ./_sources/generated.nix {};
            esbuild = nvfetcher."esbuild-${system}";
            deno = pkgs.deno;
          in
            pkgs.denoPlatform.mkDenoDerivation rec {
              inherit name;
              version = "0.1.0";

              runtimeInputs = [deno];

              src = ./.;

              env.ESBUILD_BINARY_PATH = "${esbuild.src}/bin/esbuild";

              binaryName = "main.ts";

              runtimeArgs = pkgs.denoPlatform.lib.generateFlags {
                permissions.allow.all = true;
                entryPoint = "";
                additionalDenoArgs = "--cached-only";
              };

              buildPhase = ''
                deno task build
              '';

              installPhase = ''
                mkdir -p $out/app
                cp -r ./ $out/app/
                cp -r "$TMPDIR"/deno_cache $out/app/deno_cache
                sed -i -e "1i#!/usr/bin/env -S ${lib.getExe deno} run ${runtimeArgs}" $out/app/${binaryName}
                chmod +x $out/app/${binaryName}
              '';
            };
          dockerImage = pkgs.dockerTools.buildImage {
            name = "transit-dashboard";
            tag = "latest";
            runAsRoot = ''
              #!${pkgs.runtimeShell}
              mkdir -p /db
            '';
            copyToRoot = pkgs.buildEnv {
              name = "package";
              paths = [packages.default];
            };
            config.Cmd = ["${packages.default}/main.ts"];
          };
        };
      };
      flake = {
        nixosConfigurations.container = inputs.nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";
          modules = [
            self.nixosModules.transit-dashboard
            ({pkgs, ...}: {
              # Only allow this to boot as a container
              boot.isContainer = true;
              networking.hostName = "transit-dashboard";

              # Allow nginx through the firewall
              networking.firewall.allowedTCPPorts = [8000];

              services.nginx.enable = true;
              services.nginx.tailscaleAuth.enable = true;

              services.tailscale.enable = true;
              services.tailscale.interfaceName = "userspace-networking";
              environment.variables.HTTP_PROXY = "http://localhost:1055/";

              services.transit-dashboard.enable = true;
            })
          ];
        };
        nixosModules.transit-dashboard = {
          config,
          lib,
          pkgs,
          ...
        }:
          with lib; let
            cfg = config.services.transit-dashboard;
          in {
            options.services.transit-dashboard = {
              enable = mkEnableOption "Enables the Transit Dashboard service";
            };

            config = mkIf cfg.enable {
              systemd.services."transit-dashboard" = {
                wantedBy = ["multi-user.target"];

                serviceConfig = let
                  pkg = self.packages.${system}.default;
                in {
                  Restart = "on-failure";
                  ExecStart = "${pkg}/main.ts";
                  DynamicUser = "yes";
                  RuntimeDirectory = "transit-dashboard";
                  RuntimeDirectoryMode = "0755";
                  StateDirectory = "transit-dashboard";
                  StateDirectoryMode = "0700";
                  CacheDirectory = "transit-dashboard";
                  CacheDirectoryMode = "0750";
                };
              };
            };
          };
      };
    };
}
