# Forest Conservation Targeting Tool (FCTT)

The FCTT is a web tool that aids the evaluation of forest conservation policy. It can be accessed at https://fcet.servirglobal.net. The FCTT is hosted as two CapRover apps, one for the front-end and other for the back-end.

## System Architecture

The FCTT can be accessed online and operates using a web tier and database tier. It consists of the following applications: 

1. NGINX, a web server that serves static content and routes requests to our application servers;
1. PHP Server that handles user management;
1. Tomcat, a Java-based webserver that runs Geoserver; and
1. PostgreSQL, a database that stores and manipulates geospatial data for the application server. 

The web application front-end is built using using HTML, CSS, and JavaScript. For the main page, we use the ExtJS 3.4 framework with the GeoExt extension. To enable GIS controls on the page we use Openlayers, version 2.13.1. To get map tiles we use the Google Maps API, Bing Maps API, and the Matt Hansen forest cover change maps accessed trough Google Earth Engine.

The web application uses a PostgreSQL database with POSTGIS to store the on-board data, and to store user-uploaded data. There is a second server in the application layer, Geoserver running on Apache Tomcat, which serves WMS and WFS requests from the POSTGIS database. Our maptiles are not static images and change frequently based on user actions.

There are also a set of PHP scripts which deal with user accounts, which are used to upload custom data as well as access customized layers in the FCTT.

### Front-end: JavaScript Single Page App 

The JavaScript files that are served to the front-end can be found in the public_html folder inside the subfolder /scripts. The project HTML file contains no operational code, it merely loads CSS style sheets and points to two things: 

1. The Javascript code of the application.
1. A PHP script called fctt_load.php, which loads session information from cookies if a user has logged in to their user account.

### Back-end: PHP

PHP scripts manage user accounts and are found in the `usersystem/` subfolder of the `public_html/` folder. The FCTT User Console code is in `userconsole.php`. When users user the Console to upload data, this calls `uploadData.php`. `splashscreen.php` is the login page (displayed as a window within the FCTT when user clicks "Use my own data"), and `fctt_load.php`, `logout_fctt.php`, and `passwordreminder.php` deal with user account management and logging in/out. The file `islocalhost.txt` is kept in this folder on the local copy (containing a single character "1") as a low-tech way for the FCTT to know whether it is being run locally or not.

#### User Accounts Management

User account information is stored in `usersystem/users/`. When a user registers, there are two files created that are associated with their account. `[username].xml` contains their account information, including a hash of their password. Since this hash of the password is stored in plain text, we do not allow users to create their own passwords for security reasons. Rather, they are assigned a random string of digits as password when they signup, and they can only reset this to a new random password, rather than entering their own. `[username]_logfile.txt` contains a log of user activity, including all of their logins, upload activity, etc. This can be used for debugging errors.

The subfolder `usersystem/uploads/` serves as a staging area for user uploaded files, but files are deleted from this space after the data is imported in the Postgresql database (which then becomes the only copy of the data on the server). 

The subfolder `usersystem/unitofanalysis_shapefiles/` contains data (typically just giving unit of analysis shapes with no data, except in the case of the South America 1km data) that users can download through the User Console.

### Database: PostgreSQL

PostgreSQL database used by the FCTT is called forestro_users_db. Spatial data is stored in tables within the public schema:

On board data (Mexico predios, MREDD areas, CA 10km and 1km cells, SA 10km and 1km cells), is stored here as tables that begin with `"obd_"`. User defined datasets (output from the User Console) are stored here as `"userdata_[username]_[tablename]"`.

The table "standingdesk" stores user "layerPINs", which is a system that prevents users from viewing layers associated with other users' accounts. layerPINs are also stored in user's individual XML file, so the PIN is loaded into the client's browser after they login to their account, which can then be passed to GeoServer to authenticate requests to their private user layers.

## Configuration

Troubleshooting is best done by looking at deployment and application logs on the CapRover Admin Interface.

### NGINX Web server

NGINX listens on port 80 for web client requests and then serves static content or passes the request to Tomcat. This install of NGINX has PHP enabled using php-fpm.

Important file locations:

- The main NGINX configuration is stored at: `/etc/nginx/sites-available/default`
- The configuration sets the following properties:
	- The root page served to the web is located at: `/code/public_html/`
	- Any request to `/geoserver` is proxied to Tomcat on host port 8080

### Tomcat 

Tomcat listens on host port 4894 and serves Geoserver, our mapserver.

### PostgreSQL 

We run PostgreSQL 9.5 on the default host port 5432. Our application uses PostgreSQL aggressively and the custom configurations are important.

 We enable several extensions for use with the tool:
- postgis
- postgis_topology
- fuzzystrmatch
- postgis_tiger_geocoder

