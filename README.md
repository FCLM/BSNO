Briggs Sunday Night Ops Web App
=

This a Node.js web application to tracks the events of the Briggs Planetside server (25) during sundays 7-9pm AEST/AEDT
as part of a community initiative to encourage large scale battles on a sunday. It uses Vue.js and bootstrap on the front end for user interactions which interacts with a Node.js API. Node.js also tracks players using the Daybreak Games streaming API for Planetside 2.

**Authors:**

DylanNZ, MonoNZ

**Run:**

This project requires node.js 7.6.0 or higher as it utilises ES6 JS


Install project dependencies:
_npm install_

Create database:

_knex migrate:make_

Add your Daybreak Games API key to the api_key_TEMPLATE file and delete the '_TEMPLATE' from the title.

Run application:

_node app.js_