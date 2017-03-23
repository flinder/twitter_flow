# Movers

Visualizing movement from Twitter data.
Code pertaining to the GEOG597A class project: Visualizing twitter flows


## Developer Notes

### Program Logic

#### Server side:

- `websocketServer.js`:
    * Takes request in form of `filter.state`, transforms to query and returns
      data as array of json objects

#### Client side:

- `main.js`
    * Initialize the application
        - initialize web socket connection (`init_socket()`)
        - initialize buttons and user interface (`init_btns()`)
        - initialize filter (`filter.init()`)
            * initialize `filter.state` which is empty at this point (contains 
              all filter settings)
            * Get initial set of data. This is unfiltered (`filter.state` is 
              empty). Therefore, the first `chunkSize` user objects from the DB
            * Get some general information from the database to set up the user
              interface. That is:
                - Total number of users in the DB
                - All languages in the DB
                - All countries in the DB
                - What else?
                - This info will be stored in `data.nUsers`, `data.languages`,
                  `data.countries`...
        - `init_btns()`, which creates all buttons and defines their event
            handlers 

    * As defined in the button event handlers, whenever the user interacts with
        the interface, the event handler as its last action calls 
        `filter.filter()`, which sends the current filter status to the server
        and requests the data. [This might make the app slow, should we have a
        'request data / submitt' button instead?
