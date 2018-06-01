# Cloud SQL for MySQL Node.js sample on App Engine flexible environment

This sample application shows how to use [Google Cloud SQL[[sql] for [MySQL][mysql] with SSL
on Google App Engine.



[App Engine flexible environment][appengine-flex] users: See tutorial [Using Cloud SQL for MySQL (App Engine Flexible Environment)][flex-tutorial] for more information on running and deploying this app.

[sql]: https://cloud.google.com/sql/
[mysql]: https://www.mysql.com/downloads/
[appengine-flex]: https://cloud.google.com/appengine/docs/flexible/nodejs
[appengine-std]: https://cloud.google.com/appengine/docs/standard/nodejs
[flex-tutorial]: https://cloud.google.com/appengine/docs/flexible/nodejs/using-cloud-sql
[std-tutorial]: https://cloud.google.com/appengine/docs/standard/nodejs/using-cloud-sql



## Deploying app

-  Create MySQL Cloud SQL instace in GCP project.
-  Create database and db user. Update authorized networks with you workstation public IP. This allows us connecting to cloudsql and creating tables
-  Update the DB connection details in `app.yaml` file , in `env_variables` section.
-  Get SSL certs from CloudSQL's SSL section and replace the existing certs in `ssl` directory.
-  Run `node createTables.js` and provide promted details.
-  Deploy to AppEngine using `gcloud beta app deploy --quiet`
