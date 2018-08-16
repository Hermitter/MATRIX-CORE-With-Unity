// INITIAL VARIABLES \\
var zmq = require("../node_modules/zeromq"); // Asynchronous Messaging Framework
var matrix_io = require("../node_modules/matrix-protos").matrix_io.malos.v1; // Protocol Buffers for MATRIX CORE
var matrix_ip = "127.0.0.1"; // Local IP
// MATRIX CORE Sensors
var sensor_config = {
  Humidity: {
    port: 20017,
    update_rate: 1.0,
    timeout: 5.0
  },
  Imu: {
    port: 20013,
    update_rate: 0.05,
    timeout: 5.0
  },
  Pressure: {
    port: 20025,
    update_rate: 1.0,
    timeout: 5.0
  },
  UV: {
    port: 20029,
    update_rate: 0.09,
    timeout: 5.0
  }
};

// START SENSORS \\
// Configure Each Sensor Base & Keep-Alive Port
for (sensor in sensor_config) {
  var settings = sensor_config[sensor];
  // Port configuration
  configure_base_port(settings.port, settings.update_rate, settings.timeout);
  configure_keep_alive_port(settings.port);
  configure_data_update_port(settings.port, sensor);
}

// FUNCTIONS \\
// - Base Port Configuration
function configure_base_port(driver_port, update_rate, timeout) {
  // Create a Pusher socket
  var configSocket = zmq.socket("push");
  // Connect Pusher to Base port
  configSocket.connect("tcp://" + matrix_ip + ":" + driver_port);
  // Create driver configuration
  var config = matrix_io.driver.DriverConfig.create({
    // Update rate configuration
    delayBetweenUpdates: update_rate, // 500 milliseconds between updates
    timeoutAfterLastPing: timeout // Stop sending updates 6 seconds after pings.
  });
  // Send driver configuration
  configSocket.send(matrix_io.driver.DriverConfig.encode(config).finish());
}

// - Keep-Alive Port
function configure_keep_alive_port(driver_port) {
  // Create a Pusher socket
  var pingSocket = zmq.socket("push");
  // Connect Pusher to Keep-alive port
  pingSocket.connect("tcp://" + matrix_ip + ":" + (driver_port + 1));
  // Send ping every 5 seconds
  pingSocket.send("");
  setInterval(function() {
    pingSocket.send("");
  }, 5000);
}

// - Data Update Port
function configure_data_update_port(driver_port, driver_name) {
  // Create a Subscriber socket
  var updateSocket = zmq.socket("sub");
  // Connect Subscriber to Data Update port
  updateSocket.connect("tcp://" + matrix_ip + ":" + (driver_port + 3));
  // Subscribe to messages
  updateSocket.subscribe("");
  // On Message
  updateSocket.on("message", function(buffer) {
    module.exports.data[driver_name] = matrix_io.sense[driver_name].decode(
      buffer
    ); // Update & export sensor value
  });
}

// INITIAL EXPORT \\
module.exports = {
  data: {
    Humidity: {
      humidity: 0,
      temperature: 0,
      temperatureRaw: 0,
      temperatureIsCalibrated: false
    },
    Imu: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      accelX: 0,
      accelY: 0,
      accelZ: 0,
      gyroX: 0,
      gyroY: 0,
      gyroZ: 0,
      magX: 0,
      magY: 0,
      magZ: 0
    },
    Pressure: {
      pressure: 0,
      altitude: 0,
      temperature: 0
    },
    UV: {
      uvIndex: 0,
      omsRisk: ""
    }
  },
  config: sensor_config
};