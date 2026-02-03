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
	        port: 3055,
            routes: {
                cors: true
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
        
        server.route({
	        method: 'GET',
	        path: '/api/v1/call/webhook',
	        handler: (request, h) => {
	            // return 'Hello World!';
                console.log('i am in----');
                // payloadData.email = [payloadData.email];
                console.log(request.query, '--payloadData---');
                
                const ChannelId = request.query.channelId // Assuming ChannelId is defined somewhere
                const url = `https://friendlinq.com/#/video/schedule-${ChannelId}`;
                return h.redirect(url);
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

