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
              };

              buildPhase = ''
                deno task build
              '';

              installPhase = ''
                cp -r ./ $out/
                sed -i -e "1i#!/usr/bin/env -S ${lib.getExe deno} run ${runtimeArgs}" $out/${binaryName}
                chmod +x $out/${binaryName}
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
            config = {
              Cmd = ["${packages.default}/main.ts"];
              Env = ["CACHE_DB=/db/cache.sqlite3"];
            };
          };
        };
      };
    };
}
