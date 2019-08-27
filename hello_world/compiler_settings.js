var settings = {

  app_directory: 'app',
  root_element: 'main',

  plugins: [
    {
      path: './node_modules/@lockerdome/coral.js/plugins/compile_client_app',
      settings: {
        shard_output_directory: 'static/coral_shards'
      }
    }
  ]

};

module.exports = settings;
