/**
 * Created by Anurag on 20/12/20.
 */
'use strict';
let AdminRoute        =  require('./AdminRoute');
let CustomerRoute       =  require('./CustomerRoute');

let PostRoute       =  require('./PostRoute');
let ChatRoute       =  require('./ChatRoute');
let PostGroupRoute       =  require('./PostGroupRoute');
let ScheduleCallRoute       =  require('./ScheduleCallRoute');
let all = [].concat(AdminRoute,CustomerRoute,PostRoute,ChatRoute,PostGroupRoute, ScheduleCallRoute);

module.exports = all;