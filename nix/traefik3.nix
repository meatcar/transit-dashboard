{inputs, ...}: {
  perSystem = {pkgs, ...}: let
    inherit (pkgs) lib;
  in {
    # need latest dev version of traefik for tailscale tls.
    # src has to be overriden using buildGoModule, not overrideAttrs.
    # source https://github.com/NixOS/nixpkgs/issues/86349
    packages.traefik = pkgs.traefik.override {
      buildGoModule = args:
        pkgs.buildGoModule.override {go = pkgs.go_1_22;} (args
          // rec {
            version = "3.0.0-rc2";
            src = inputs.traefik;
            vendorHash = "sha256-yFv5ScXw65NyA3VlrlN8aLFDCJVMmG1r1p7X+xCXWto=";
            # fix version and $CODENAME discovery. pulled from nixpkgs#traefik (v2)
            preBuild = ''
              GOOS= GOARCH= CGO_ENABLED=0 go generate

              CODENAME=$(awk -F "=" '/CODENAME=/ { print $2}' script/crossbinary-default.sh)

              buildFlagsArray+=("-ldflags= -s -w \
                -X github.com/traefik/traefik/v${lib.versions.major version}/pkg/version.Version=${version} \
                -X github.com/traefik/traefik/v${lib.versions.major version}/pkg/version.Codename=$CODENAME")
            '';
          });
    };
  };
}
