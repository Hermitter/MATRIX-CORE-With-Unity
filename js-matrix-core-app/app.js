// INITIAL VARIABLES \\
const io = require("socket.io")(6001); // Start socket.io server
const sensors = require("./core_libraries/sensors.js"); // MATRIX CORE sensors
const async = require("async");
console.log("\nServer Started!\n");

// SOCKET.IO \\
io.on("connection", function(socket) {
  console.log("Client Connected\n");

  // Sensor data to send
  let sensors_desired = {
    Humidity: false,
    Imu: false,
    Pressure: false,
    UV: false
  };

  // Setup Sensor Event listeners
  for (let sensor in sensors_desired) {
    // Sensors Start Event Listeners
    socket.on(sensor + " start", function() {
      sensors_desired[sensor] = true;
      console.log("Sending " + sensor + " data...");
    });
    // Sensor Stop Event Listeners
    socket.on(sensor + " stop", function() {
      sensors_desired[sensor] = false;
      console.log("Stopping " + sensor + " data...");
    });
  }

  // Confirm that sever is ready
  socket.emit("initialized");
});

// FUNCTIONS \\
function emit_repeating_data(data, delay) {}


///////////////////////////////////////////////////////////
// TEST BLOCK REMOVE AFTER!!!!!!!!!!!!!

// function emit_sensor_data() {
//   async.forEachOf(sensors_desired, function(value, sensor, callback) {
//       if (sensors_desired[sensor]) {
//         socket.volatile.emit(sensor + " data", sensors.data[sensor]);
//       }
//       callback();
//     },function() {setTimeout(emit_sensor_data, 50);}
//   );
// }
// emit_sensor_data();

// TEST BLOCK REMOVE AFTER!!!!!!!!!!!!!
///////////////////////////////////////////////////////////
