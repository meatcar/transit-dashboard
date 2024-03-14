{inputs, ...}: {
  perSystem = {
    pkgs,
    system,
    ...
  }: let
    name = "transit-dashboard";
  in {
    _module.args.pkgs = import inputs.nixpkgs {
      inherit system;
      overlays = [inputs.nix-deno.overlays.default];
    };
    packages.${name} = let
      nvfetcher = pkgs.callPackage ../_sources/generated.nix {};
      esbuild = nvfetcher."esbuild-${system}";
      deno = pkgs.deno;
    in
      pkgs.denoPlatform.mkDenoDerivation rec {
        # loosely based on mkDenoPackage
        inherit name;
        version = "0.1.0";

        runtimeInputs = [deno];

        src = ./..;

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
  };
}
