// INITIAL VARIABLES \\
const io = require("socket.io")(6001); // Start socket.io server
const sensors = require("./core_libraries/sensors.js"); // MATRIX CORE sensors
console.log("\nServer Started!\n");

// SOCKET.IO \\
io.on("connection", function(socket) {
  console.log("Client Connected\n");

  // Sensor data to send
  let activeSensors = {
    Humidity: false,
    Imu: false,
    Pressure: false,
    UV: false
  };

  // - Endless loop
  function send_event(sensor, delay, callback) {
    if (activeSensors[sensor]) {
      callback();
      // Run function again with delay
      setTimeout(function() {
        send_event(sensor, delay, callback);
      }, delay);
    }
  };

  // Configure Sensor Events
  for (let sensor in activeSensors) {
    // Sensor Start Event Listener
    socket.on(sensor + " start", function() {
      activeSensors[sensor] = true;
      console.log("Sending " + sensor + " data...\n");

      // Begin sending sensor data
      send_event(sensor, sensors.config[sensor].update_rate * 1000, function() {
        socket.volatile.emit(sensor + " data", sensors.data[sensor]);
      });
    });

    // Sensor Stop Event Listener
    socket.on(sensor + " stop", function() {
      activeSensors[sensor] = false;
      console.log("Stopping " + sensor + " data...\n");
    });
  }

  // Confirm that sever is ready
  socket.emit("Initialized");
});
