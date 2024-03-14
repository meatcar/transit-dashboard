{
  description = "Accessible transit dashboard using transitapp's API";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    nix-deno.url = "github:nekowinston/nix-deno";
    nix2container.url = "github:nlewo/nix2container";
    traefik = {
      url = "github:traefik/traefik/v3.0.0-rc2";
      flake = false;
    };
  };

  outputs = inputs @ {self, ...}:
    inputs.flake-parts.lib.mkFlake {inherit inputs;} {
      systems = ["x86_64-linux" "x86_64-darwin" "aarch64-linux" "aarch64-darwin"];
      imports = [
        # flake modules
        ./nix/traefik3.nix
        ./nix/package.nix
        ./nix/docker.nix
      ];
      perSystem = {
        self',
        pkgs,
        ...
      }: {
        devShells.default = pkgs.mkShell {
          inherit (self'.packages.default) name;
          buildInputs = with pkgs; [
            deno
            nvfetcher
          ];
          shellHook = ''
            deno task
          '';
        };
        packages.default = self'.packages.transit-dashboard;
      };
    };
}
