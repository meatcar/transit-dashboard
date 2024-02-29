{
  self',
  pkgs,
  name,
}: let
  layeredOpts = {
    name = "meatcar/${name}";
    tag = "latest";
    contents = [
      self'.packages.default
      pkgs.tailscale
      pkgs.busybox
    ];
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
in {
  dockerLayeredImage = pkgs.dockerTools.buildLayeredImage (
    layeredOpts
    // {
      maxLayers = 125;
    }
  );

  dockerImage = pkgs.dockerTools.buildImage {
    inherit (layeredOpts) name tag config;
    copyToRoot = pkgs.buildEnv {
      name = "image-root";
      paths = layeredOpts.contents;
    };
  };
}
