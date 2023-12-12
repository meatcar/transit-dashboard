{
  description = "Accessible transit dashboard using transitapp's API";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = inputs@{ self, ... }:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "x86_64-darwin" "aarch64-linux" "aarch64-darwin" ];
      perSystem = { pkgs, inputs', ... }:
        let
          name = "transit-dashboard";
        in
        {
          devShells.default = pkgs.mkShell {
            inherit name;
            buildInputs = with pkgs; [
              deno
            ];
          };
        };
    };
}
