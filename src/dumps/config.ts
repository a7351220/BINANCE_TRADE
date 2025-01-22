export const config = {
    data_streams: {
        pairs: ['btc'],
        min_price: 25000,
        min_price_whale: 100000,
        dump_file_name: 'dumps/orders.csv',
    },
};

// {
//     "e": "trade",       // Event type
//     "E": 1672515782136, // Event time
//     "s": "BNBBTC",      // Symbol
//     "t": 12345,         // Trade ID
//     "p": "0.001",       // Price
//     "q": "100",         // Quantity
//     "T": 1672515782136, // Trade time
//     "m": true,          // Is the buyer the market maker?
//     "M": true           // Ignore
//   }