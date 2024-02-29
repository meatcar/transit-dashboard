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
      in {
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
        packages = let
          nvfetcher = pkgs.callPackage ./_sources/generated.nix {};
          esbuild = nvfetcher."esbuild-${system}";
          deno = pkgs.deno;
        in rec {
          transit-dashboard = default;
          default = pkgs.denoPlatform.mkDenoDerivation rec {
            # loosely based on mkDenoPackage
            inherit name;
            version = "0.1.0";

            runtimeInputs = [deno];

            src = ./.;

            env.ESBUILD_BINARY_PATH = "${esbuild.src}/bin/esbuild";

            binaryName = "main.ts";

            runtimeArgs = pkgs.denoPlatform.lib.generateFlags {
              entryPoint = "";
              permissions.allow.all = true;
              additionalDenoArgs = "--cached-only";
            };

            buildPhase = ''
              mkdir -p cache
              deno task build
            '';

            installPhase = ''
              mkdir -p $out/app
              cp -r ./ $out/app/
              cp -r "$TMPDIR"/deno_cache $out/app/
              sed -i -e "1i#!/usr/bin/env -S ${deno}/bin/deno run ${runtimeArgs}" $out/app/${binaryName}
              chmod +x $out/app/${binaryName}
            '';
          };

          dockerImage = pkgs.dockerTools.buildImage {
            inherit (dockerLayeredImage) name tag config;
            copyToRoot = pkgs.buildEnv {
              name = "image-root";
              paths = dockerLayeredImage.contents;
            };
          };

          dockerLayeredImage = pkgs.dockerTools.buildLayeredImage {
            inherit name;
            tag = "latest";
            contents = [
              default
              pkgs.tailscale
              pkgs.busybox
            ];
            maxLayers = 125;
            config = {
              Env = [
                "TS_AUTHKEY=CHANGEME"
                "TS_AUTHKEY__FILE=CHANGEME"
                "TS_STATE_DIR=/var/lib/tailscale"
                "DENO_DIR=/app/deno_cache"
              ];
              WorkingDir = "/app";
              Entrypoint = ["/bin/sh" "-c"];
              Cmd = [
                ''
                  mkdir -p "$TS_STATE_DIR" && \
                  tailscaled --statedir "$TS_STATE_DIR" & \
                  tailscale up --authkey=$(cat $TS_AUTHKEY__FILE || echo $TS_AUTHKEY) && \
                     /app/main.ts
                ''
              ];
            };
          };
        };
      };
      flake = {};
    };
}
