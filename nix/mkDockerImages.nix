{
  self',
  pkgs,
  name,
}: rec {
  dockerImage = pkgs.dockerTools.buildImage {
    inherit (dockerLayeredImage) name tag config;
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      paths = dockerLayeredImage.contents;
    };
  };

  dockerLayeredImage = pkgs.dockerTools.buildLayeredImage {
    name = "meatcar/${name}";
    tag = "latest";
    contents = [
      self'.packages.default
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
}
