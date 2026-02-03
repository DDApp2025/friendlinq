'use strict';

const Hapi        = require('@hapi/hapi');
const HapiSwagger = require('hapi-swagger');
const Inert       = require('inert');
//const HapiError   = require('hapi-error');
const Vision      = require('vision')
const Pack = require('./package');
const hapiSocketIo = require('hapi-socket.io')
const SocketManager = require('./Utils/SocketManager');

const Routes = require('./Routes');
const UniversalFunctions = require('./Utils/UniversalFunctions');


const init = async () => {
	try {
        const server = Hapi.server({
	        port: 3155,
//            host: '127.0.0.1',
            routes: {
                cors: {
                    origin: ['*'],
                    additionalHeaders: ['cache-control', 'x-requested-with']
                    //additionalHeaders: ['x-logintoken'],
                    //additionalExposedHeaders: ['x-logintoken']
                }
            },
        });
        SocketManager.connectSocket(server);
        const swaggerOptions = {
	        info: {
                title: 'API Documentation',
                version: Pack.version,
	        },
	        grouping: 'tags'
        };
        await server.register(Inert);
        await server.register(require('vision'));
        //await server.register(require('hapi-error'));
        
        await server.register({
            plugin: HapiSwagger,
            options: swaggerOptions
        });
        
        server.route({
            path: "/uploads/{path*}",
            method: "GET",
            handler: {
                directory: {
                    path: "./uploads",
                    listing: false,
                    index: false
                }
            }
        });
        
        server.route({
	        method: 'GET',
	        path: '/',
	        handler: (request, h) => {
	            return 'Hello World!';
	        }
        });
        server.route(Routes);
        await server.start(); console.log('Server running on %s', server.info.uri);
        return server;
	}catch (e) {
      throw e;
    }    
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

