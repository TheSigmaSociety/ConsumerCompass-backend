// endpoint: https://api.upcitemdb.com/prod/trial/lookup?upc={barcodeNumber}
const axios = require("axios");

function getProductByBarcode(barcodeNumber) {
    const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcodeNumber}`;

    return axios
        .get(url)
        .then((response) => {
            if (
                response.data &&
                response.data.items &&
                response.data.items.length > 0
            ) {
                return response.data.items[0]; // Return the first item found
            } else {
                throw new Error("No product found for this barcode");
            }
        })
        .catch((error) => {
            throw new Error(`Error fetching product: ${error.message}`);
        });
}

module.exports = {
    getProductByBarcode
};