exports.handler = async (event) => {
    console.log(event);
    return event.key1 + event.key2 ;
};
