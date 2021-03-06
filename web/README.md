

# Platform Services Registry - Web

This is the Web component for the Platform Services Registry. It is meant to be a central point of access to the data and functionality provided by the registry.

## Build

Building the Web image is straight forward; the following instructions will guide you through the process.

### Build Config

Building this component requires the Caddy 2.x S2I base image. Use the instructions found [here](https://github.com/bcgov/s2i-caddy-nodejs) to create this image in your `tools` namespace.

To create a basic `BuildConfig` apply the `build.yaml` file to your local tools namespace. You can run this manually or create CI/CD mechanics to automate the process.

```console
oc process -f web/openshift/templates/build.yaml| oc apply -f -
```

### Pipeline / Workflow

The project repository has CI/CD mechanics based on GitHub actions. This workflow is currently configured; To run your own workflow you will need to fork the repo so you can setup your own secrets and edit the namespace in [the workflow manifest](../.github/workflows/web.yml).

Once configured, the workflow will trigger the S2I image build process when the appropriate changes are detected on the `master` branch.

1. Create a restricted service account using [this](../openshift/cicd.yaml) OCP template.
2. Set the `OpenShiftServerURL` to your OpenShift console URL.
3. Set the `OpenShiftToken` to the access token created by Step 1; you'll find a newly minted secret with the relevant token.

### Pro Tip 🤓

The workflow has CodeClimate integrated. Either setup your own CodeClimate instance or remove the reference in yur forked repo.

## Deploying the Web

Now that you've successfully minted your very own copy of the Web image in your `tools` namespace, we'll deploy it so you can do something useful with it. We'll run through the following steps and the sample commands for each one:

1. Deploy the Caddy config;
2. Deploy the Web component.

### Deploy the Caddyfile

The Web site is served out by [Caddy](https://caddyserver.com) a light weight, easy to configure, cloud native web server. Caddy is built into the base image and then this website is layered over that. The config for Caddy, also knows as a `Caddyfile` is stored in OpenShift as a `ConfigMap` and mounted as a file inside the running container.

Review the contents of the [config.yaml](./openshift/templates/config.yaml). You don't need to make any changes unless you notice that something wont' work.

Once you're happy with the Caddy config, create the `ConfigMap` in your environment:

```yaml
oc process -f web/openshift/templates/config.yaml| \
oc apply -f -
```

Next, deploy the newly minted API image with the following command. This will create all the components required to run the API.

```console
  oc process -f web/openshift/templates/deploy.yaml \
    -p NAMESPACE=$(oc project --short) \
    -p SOURCE_IMAGE_NAMESPACE=<YOUR_TOOLS_NAMESPACE> \
    -p SOURCE_IMAGE_TAG=<dev | test | prod> \
    -p SSO_BASE_URL=https://sso-dev.pathfinder.gov.bc.ca \
    -p CLUSTER_DOMAIN=apps.silver.devops.gov.bc.ca | \
    oc apply -f -
  ```

### Pro Tip 🤓
  
The deployment manifest assumes you're using image tags (or config changes) to trigger a deployment. If you haven't yet created deployable images scale down the deployment.

How to Scale (from your dev/test/prod namespace)
```console
oc scale dc/registry-api --replicas=0
```

How to Tag (from your tools namespace)
```console
oc tag platsrv-registry-web:latest platsrv-registry-web:dev
```

### Schema Build-out (Step 4)

We need to build out the database schema before the API can do anything useful with it.

Examine your database credentials with the following command and make a note of the `user` property. This is the application (API Pod) account used to access the database.

```console
oc get secret/registry-postgres-creds -o yaml
```

Find out what your database Pod name is and use a variant of the following command to port forward to it:

```console
oc port-forward registry-postgres-1-rz6nz 5432
```

Run a local instance of PostgreSQL. This will give you acess to the `psql` command line tool and mount a volume so we can access the SQL scripts. This command assumes you're running it form the `api` subdirectory in the source repo.

```console
docker run -it --rm --name blarb \
-v $(pwd):/opt/src postgres /bin/bash
```
docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
root@d7fc5e936e34:/# psql -U postgres -h host.docker.internal
psql (12.0 (Debian 12.0-1.pgdg100+1), server 12.1)
Type "help" for help.

postgres=# \du
                                   List of roles
 Role name |                         Attributes                         | Member of 
-----------+------------------------------------------------------------+-----------
 6yve3bce  |                                                            | {}
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

postgres=# 

psql -U postgres -d registry -h host.docker.internal -f /opt/src/db/sql/0001.sql -v ROLLNAME=app_api_oksb6iie






