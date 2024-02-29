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
        self',
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
        packages =
          {
            default = import nix/mkPackage.nix {inherit pkgs system name;};
          }
          // (import nix/mkDockerImages.nix {inherit self' pkgs name;});
      };
      flake = {};
    };
}
