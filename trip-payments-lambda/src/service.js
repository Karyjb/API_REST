import AWS from 'aws-sdk';

const tableName = "trip-payments";

const dynamodb = new AWS.DynamoDB.DocumentClient();

//Metodo para recibir los parametros de consulta en Dynamodb
async function getDynamoData(projectionExpression, idTrip) {
    try {

        const params = {
            TableName: tableName, // Reemplaza 'NombreDeTuTabla' con el nombre de tu tabla en DynamoDB
            ProjectionExpression: projectionExpression, // Especifica los campos que deseas sumar
            FilterExpression: 'idTrip = :idTrip', // Especifica la expresión de filtro
            ExpressionAttributeValues: { // Especifica los valores de atributo de expresión
                ':idTrip': idTrip // Reemplaza 'valorDeseado' con el valor que deseas filtrar
            }
        };

        console.log("antes de escanear la tabla");
        const data = await dynamodb.scan(params).promise(); // Espera a que se resuelva la operación de escaneo
        console.log("despues de escanear la tabla", data);
        return data;
    }
    catch (exception) {
        console.log("Exception in getDynamoData: ", exception);

    }

}

//Metodo para calcular el total de los pagos del viaje
export const geTotalByTrip = async (idTrip) => {

    console.log("init totalByTrip")

    try {
        let data = await getDynamoData("amount", idTrip);
        // Procesar los resultados para calcular la suma de los campos especificados
        let totalAmount = 0;

        data.Items.forEach(item => {
            // Sumar el valor del campo amount de cada elemento
            totalAmount += item.amount || 0;
        });

        // Imprimir la suma de los campos
        console.log("Suma del viaje:", totalAmount);
        return totalAmount;
    }
    catch (err) {
        console.error("Error al escanear la tabla:", err);
        throw err; // Reenvía el error para que sea manejado por el código que llama a esta función
    }
};

//Metodo para obtener  los pagos realizados por cada usuario
export const getAmountByUser = async (idTrip) => {
    console.log("init getAmountByUser")

    try {
        let data = await getDynamoData("paymentUsers", idTrip);
        // Procesar los resultados para calcular la suma de los campos especificados

        const payAdd = new Map();

        data.Items.forEach(item => {
            item.paymentUsers.forEach(paymentUser => {
                console.log("item :", paymentUser.name);
                if (payAdd.get(paymentUser.name) == undefined) {
                    payAdd.set(paymentUser.name, paymentUser.payByUser);

                } else {
                    let newValue = paymentUser.payByUser + payAdd.get(paymentUser.name);
                    payAdd.set(paymentUser.name, newValue);
                }
            });
        });
        /*  
         let userObject = Object.fromEntries(payAdd); 
          let totalAmount = JSON.stringify(userObject);
          console.log("typeof",typeof(totalAmount));
           let totalAmountbyUser = JSON.parse(totalAmount);
   
          // Imprimir la suma por cada usuario
           console.log("Suma de por cada usuario: ", totalAmountbyUser);*/
        return payAdd;
    }
    catch (err) {
        console.error("Error al escanear la tabla:", err);
        throw err; // Reenvía el error para que sea manejado por el código que llama a esta función
    }
};

//Metodo para calcular cuanto debe pagar cada usuario (promedio)

export const getTotalByUser = async (idTrip) => {

    console.log("init getTotalByUser")

    try {
        /*let data = await getDynamoData("paymentUsers", idTrip);
        console.log("getDynamoData:", getDynamoData)*/
        // Procesar los resultados para calcular la suma de los campos especificados
        const totalAmountTrip = await geTotalByTrip(idTrip);
        const functionUserAmount = await getAmountByUser(idTrip);
        const totalUser = functionUserAmount.size;

        console.log("totalUser", totalUser);
        console.log("totalAmountTrip", totalAmountTrip);
        let totalByUser = totalAmountTrip / totalUser;

        // totalByUser = roundNumber(totalByUser);
        //totalByUser = Math.round(totalByUser / 50) * 50; //Redondea hacia arriba al múltiplo de 100 más cercano

        // Imprimir la suma de los campos
        console.log("Valor que debe pagar cada usuario:", totalByUser);
        return totalByUser;
    }
    catch (err) {
        console.error("Error al escanear la tabla:", err);
        throw err; // Reenvía el error para que sea manejado por el código que llama a esta función
    }
};

//Metodo para indicar que debe cada uno los pagos de cada  usuario
export const getPaymentsDistribution = async (idTrip) => {

    console.log("init getPaymentsDistribution")

    try {

        let payAverage = await getTotalByUser(idTrip);
        const totalByUsers = await getAmountByUser(idTrip);
        console.log("payAverage", payAverage);
        console.log("totalByUsers", totalByUsers);

        console.log("typeof", typeof (payAverage));


        let arrayData = [];

        for (const entry of totalByUsers.entries()) { //recorrer un Map();
            const [key, value] = entry;
            console.log("for:", key, value);

            if (value === payAverage) {
                let payValue = value - payAverage;
                const userData = new UserPay(key, value, 'Felicidades, estas al dia, tu valor a pagar es: ' + payValue, payValue, "AL DIA");
                arrayData.push(userData);
                //debtFreeUsers.push(userData);

            } else if (value > payAverage) {
                let payValue = value - payAverage;
                const userData = new UserPay(key, value, 'Tu saldo a favor es: ' + payValue, payValue, "SALDO A FAVOR");
                arrayData.push(userData);
                //creditBalanceUsers.push(userData);

            } else if (value < payAverage) {
                let payValue = payAverage - value;
                const userData = new UserPay(key, value, 'Tu valor a pagar es: ' + payValue, payValue, "DEBE");
                arrayData.push(userData);
                //owesUserss.push(userData);
            }
            //  arrayData.push(userData);
        };

        console.log("arrayData", arrayData);

        // Imprimir la suma de los campos
        console.log("Suma del viaje:", arrayData);
        return arrayData;
    }
    catch (err) {
        console.error("Error al escanear la tabla:", err);
        throw err; // Reenvía el error para que sea manejado por el código que llama a esta función
    }
};

//Metodo para indicar como se deben distribuir los pagos de cada  usuario
export const getWhoPay = async (idTrip) => {

    console.log("init getWhoPay");

    try {
        let data = await getPaymentsDistribution(idTrip);
        const averageTotalByUser = await getTotalByUser(idTrip);

        let creditBalanceUsers = data.filter(st => st.status == "SALDO A FAVOR"); //construccion del filtro con predicado (lambda que evalua una condición)
        console.log("creditBalanceUsers", creditBalanceUsers);
        let owesUsers = data.filter(st => st.status == "DEBE");
        let commitsUser = "";
        

        for (let i = 0; i < owesUsers.length; i++) {
            for (let z = 0; z < creditBalanceUsers.length; z++) {
                if (owesUsers[i].totalValue > creditBalanceUsers[z].totalValue) {

                    //Actualiza información del usuario que debe
                    
                    commitsUser += owesUsers[i].name + " paga la suma de: " + creditBalanceUsers[z].totalValue + " a: " + creditBalanceUsers[z].name + "\n";
                    owesUsers[i].totalValue -= creditBalanceUsers[z].totalValue; //actualiza valor del usuario que debe
                    owesUsers[i].descriptionPay = (" Tu nuevo saldo a pagar es : " + creditBalanceUsers[z].totalValue);

                    //Actualiza información del Usuario que tiene saldo a favor
                    //let z = creditBalanceUsers[z].findIndex((obj => obj.name = creditBalanceUsers[z].name));
                    console.log('Before update: ', creditBalanceUsers[z]);
                    creditBalanceUsers[z].totalValue = 0;
                    creditBalanceUsers[z].status = "AL DIA";
                    creditBalanceUsers[z].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;
                    //creditBalanceUsers.splice(z, 1);
                    console.log('After update: ', creditBalanceUsers[z]);

                } else if (owesUsers[i].totalValue < creditBalanceUsers[z].totalValue) {

                    //Actualiza información del usuario que debe

                    creditBalanceUsers[z].totalValue -= owesUsers[i].totalValue; //actualiza valor a favor el usuario que tiene saldo a favor
                    commitsUser += owesUsers[i].name + " paga la suma de: " + owesUsers[i].totalValue + " a: " + creditBalanceUsers[z].name + "\n";
                    creditBalanceUsers[z].descriptionPay = (" Tu nuevo saldo a favor es: " + creditBalanceUsers[z].totalValue);
                    console.log("creditBalanceUsers[z].descriptionPay", creditBalanceUsers[z].descriptionPay);

                    //Actualiza información del usuario que debe

                    console.log('Before update: ', owesUsers[i]);
                    owesUsers[i].totalValue = 0;
                    owesUsers[i].status = "AL DIA";
                    owesUsers[i].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;

                    console.log('After update1: ', owesUsers[i]);

                    //owesUsers.splice(i, 1);
                    console.log('elementowesUsers: ', 1);
                    console.log('After update2: ', owesUsers[i]);

                    break;

                } else {
                    //Actualizar el usuario que tiene saldo a favor

                    //let z = creditBalanceUsers.findIndex((obj => obj.name = creditBalanceUsers[z].name));
                    console.log('Before update: ', creditBalanceUsers[z]);
                    creditBalanceUsers[z].totalValue = 0;
                    creditBalanceUsers[z].status = "AL DIA";
                    creditBalanceUsers[z].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;
                    
                    console.log('After update: ', creditBalanceUsers[z]);

                    //Actualiza información del usuario que debe
                    //let i = owesUsers.findIndex((obj => obj.name = owesUsers[i].name));
                    console.log('Before update: ', owesUsers[i]);
                    owesUsers[i].totalValue = 0;
                    owesUsers[i].status = "AL DIA";
                    owesUsers[i].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;
                    
                    console.log('After update: ', owesUsers[i]);
                    break;

                }

            }

        }

        return commitsUser;
    }

    catch (err) {
        console.error("Error al escanear la tabla:", err);
        throw err; // Reenvía el error para que sea manejado por el código que llama a esta función
    }
};



//clase para crear los usuarios y propiedades
class UserPay {
    constructor(name, amountPay, descriptionPay, totalValue, status) {
        this.name = name;
        this.amountPay = amountPay;
        this.descriptionPay = descriptionPay;
        this.totalValue = totalValue;
        this.status = status;
    }

    setStatus(status) {
        this.status = status;

    }

    setTotalValue(totalValue) {
        this.totalValue = totalValue;

    }


}

//Metodo que controla la operaciones de pago
export const main = async (idTrip, operation) => {
    switch (operation) {
        case "getAmountByUser":
            console.log("getAmountByUser");
            //return await getAmountByUser(idTrip);
            let result = await getAmountByUser(idTrip);
            let userObject = Object.fromEntries(result); //retorna un objeto clave-valor
            let totalAmount = JSON.stringify(userObject);// convier de un valor js a un valor JSON
            let totalAmountbyUser = JSON.parse(totalAmount); //convertir de JSON a objeto


            return totalAmountbyUser;
            break;

        case "geTotalByTrip":
            console.log("geTotalByTrip");
            return await geTotalByTrip(idTrip);
            break;

        case "getTotalByUser":
            console.log("getTotalByUser");
            return await getTotalByUser(idTrip);
            break;

        case "getPaymentsDistribution":
            console.log("getPaymentsDistribution");
            return await getPaymentsDistribution(idTrip);
            break;

        case "getWhoPay":
            console.log("getWhoPay");
            return await getWhoPay(idTrip);
            break;
    }

};




