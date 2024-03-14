{
  perSystem = {
    self',
    inputs',
    pkgs,
    ...
  }: let
    inherit (inputs'.nix2container.packages) nix2container;
    inherit (pkgs) lib;
    app = self'.packages.default;
    inherit (app) name;

    yaml = pkgs.formats.yaml {};

    resolver = "ts";
    traefikStaticConfig = yaml.generate "traefik_static_conf.yaml" {
      certificatesResolvers.${resolver}.tailscale = {};
      entryPoints.web.address = ":80";
      entryPoints.web.http.redirections.entryPoint.to = "websecure";
      entryPoints.web.http.redirections.entryPoint.scheme = "https";
      entryPoints.web.http.redirections.entrypoint.permanent = true;
      entryPoints.websecure.address = ":443";
      providers.file.filename = traefikDynamicConfig;
    };

    traefikDynamicConfig = let
      service = name;
      router = {
        inherit service;
        rule = "Host(`{{ env \"TS_DOMAIN_NAME\" }}`)";
      };
    in
      yaml.generate "traefik_dynamic_conf.yaml" {
        http.routers."http" = router;
        http.routers."https" = router // {tls.certResolver = resolver;};
        http.services.${service}.loadBalancer.servers = [{url = "http://127.0.0.1:8000";}];
      };

    initDirs = pkgs.writeShellScriptBin "initDirs" ''
      mkdir -p "$TS_STATE_DIR"
      mkdir -p $(dirname "$TS_SOCKET")
    '';

    dockerEntrypoint = pkgs.writeShellScriptBin "entrypoint" ''
      ensure() {
        $* || (echo "failed to run $1" >&2; exit 1)
      }
      ensure initDirs
      ensure tailscaled --statedir "$TS_STATE_DIR"&
      ensure tailscale up --authkey="$(cat "$TS_AUTHKEY__FILE" || echo "$TS_AUTHKEY")"
      export TS_DOMAIN_NAME=$(tailscale status --json | jq -r .Self.DNSName[:-1])
      ensure /app/main.ts &
      # mkdir -p /app/public
      # ensure static-web-server -p 8000 &
      PID=$!
      ensure traefik --configFile=${traefikStaticConfig} &
      wait $PID
    '';

    deps = [self'.packages.traefik] ++ (with pkgs; [tailscale jq busybox]);

    runtimeDeps = with pkgs.dockerTools; [
      caCertificates
      binSh
    ];

    appDeps = [initDirs dockerEntrypoint];

    contents = deps ++ runtimeDeps ++ appDeps ++ [app];

    layeredOpts = {
      inherit contents;
      name = "meatcar/${name}";
      tag = "latest";
      config = {
        Env = [
          "PATH=${lib.strings.makeSearchPath "bin" (["/"] ++ deps)}"
          "TS_AUTHKEY=CHANGEME"
          "TS_STATE_DIR=/var/lib/tailscale"
          "DENO_DIR=/app/deno_cache"
          "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
        ];
        WorkingDir = "/app";
        Entrypoint = ["sh" "-c"];
        Cmd = ["/bin/entrypoint"];
      };
    };
  in {
    packages = {
      inherit traefikStaticConfig;
      dockerLayeredImage = pkgs.dockerTools.buildLayeredImage (
        layeredOpts // {maxLayers = 125;}
      );

      streamLayeredImage = pkgs.dockerTools.streamLayeredImage (
        layeredOpts // {maxLayers = 125;}
      );

      nix2containerImage = nix2container.buildImage {
        inherit (layeredOpts) name tag config;
        copyToRoot = appDeps;
        layers = [
          (nix2container.buildLayer {inherit deps;})
          (nix2container.buildLayer {copyToRoot = runtimeDeps;})
          (nix2container.buildLayer {copyToRoot = [app];})
        ];
      };
      dockerImage = pkgs.dockerTools.buildImage {
        inherit (layeredOpts) name tag config;
        copyToRoot = pkgs.buildEnv {
          name = "image-root";
          paths = layeredOpts.contents;
        };
      };
    };
  };
}
