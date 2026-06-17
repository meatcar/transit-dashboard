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
      pkgs.denoPlatform.mkDenoDerivation {
        # loosely based on mkDenoPackage
        inherit name;
        version = "0.1.0";

        runtimeInputs = [deno];

        src = ./..;

        # Fresh 2 uses Vite which calls esbuild internally; supply the
        # pre-fetched native binary so the sandbox build doesn't need network.
        env.ESBUILD_BINARY_PATH = "${esbuild.src}/bin/esbuild";

        # Unused by the overridden installPhase but required by mkDenoDerivation.
        binaryName = "main.ts";

        buildPhase = ''
          mkdir -p cache
          deno task build
        '';

        installPhase = ''
          mkdir -p $out/app $out/bin
          # Copy source tree (includes _fresh/ built by vite in buildPhase).
          cp -r ./ $out/app/
          # Copy the Deno module cache populated by mkDenoDerivation.
          cp -r "$TMPDIR"/deno_cache $out/app/

          # Wrapper script: run the pre-built Fresh 2 server artifact.
          printf '#!/bin/sh\nDENO_DIR=%s/app/deno_cache exec ${deno}/bin/deno serve -A --cached-only %s/app/_fresh/server.js "$@"\n' \
            "$out" "$out" > $out/bin/${name}
          chmod +x $out/bin/${name}
        '';
      };
  };
}
