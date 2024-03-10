        let data = await getPaymentsDistribution(idTrip);
        const averageTotalByUser = await getTotalByUser(idTrip);

        let creditBalanceUsers = data.filter(st => st.status == "SALDO A FAVOR"); //construccion del filtro con predicado (lambda que evalua una condición)
        console.log("creditBalanceUsers", creditBalanceUsers);
        let owesUsers = data.filter(st => st.status == "DEBE");

        
        owesUsers.forEach(owesUser => {
            creditBalanceUsers.forEach(creditBalanceUser => {
                /*Si el valor que debe el usuario es mayor al valor que tiene a favor el otro usuario, 
                el usuario que debe , paga al que tiene saldo a Favor y este sale del arreglo de saldo a Favor.
                  */
                if (owesUser.totalValue > creditBalanceUser.totalValue) {

                    //Actualiza información del usuario que debe
                    console.log(owesUser.name + " paga la suma de: " + creditBalanceUser.totalValue + " a: " + creditBalanceUser.name);
                    owesUser.totalValue -= creditBalanceUser.totalValue; //actualiza valor del usuario que debe
                    owesUser.descriptionPay = (" Tu nuevo saldo a pagar es : " + creditBalanceUser.totalValue);

                    //Actualiza información del Usuario que tiene saldo a favor
                    let elementsCreditBalance = creditBalanceUsers.findIndex((obj => obj.name = creditBalanceUser.name));
                    console.log('Before update: ', creditBalanceUsers[elementsCreditBalance]);
                    creditBalanceUsers[elementsCreditBalance].totalValue = 0;
                    creditBalanceUsers[elementsCreditBalance].status = "AL DIA";
                    creditBalanceUsers[elementsCreditBalance].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;
                    creditBalanceUsers.splice(elementsCreditBalance, 1);
                    console.log('After update: ', creditBalanceUsers[elementsCreditBalance]);
                    

                } else if (owesUser.totalValue < creditBalanceUser.totalValue) {

                    //Actualiza información del usuario que debe

                    creditBalanceUser.totalValue -= owesUser.totalValue; //actualiza valor a favor el usuario que tiene saldo a favor
                    console.log(owesUser.name + " paga la suma de: " + owesUser.totalValue + " a: " + creditBalanceUser.name);
                    creditBalanceUser.descriptionPay = (" Tu nuevo saldo a favor es: " + creditBalanceUser.totalValue);
                    console.log("creditBalanceUser.descriptionPay", creditBalanceUser.descriptionPay);

                    //Actualiza información del usuario que debe
                    let elementOwesUser = owesUsers.findIndex((obj => obj.name = owesUser.name));
                    console.log('Before update: ', owesUsers[elementOwesUser]);
                    owesUsers[elementOwesUser].totalValue = 0;
                    owesUsers[elementOwesUser].status = "AL DIA";
                    owesUsers[elementOwesUser].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;
                    
                    console.log('After update1: ', owesUsers[elementOwesUser]);
                    
                    owesUsers.splice(elementOwesUser, 1);
                    console.log('elementOwesUser: ', elementOwesUser);
                    console.log('After update2: ', owesUsers[elementOwesUser]);
                    console.log('After update2: ', owesUsers[1]);
                    

                } else {
                    //Actualizar el usuario que tiene saldo a favor

                    let elementsCreditBalance = creditBalanceUsers.findIndex((obj => obj.name = creditBalanceUser.name));
                    console.log('Before update: ', creditBalanceUsers[elementsCreditBalance]);
                    creditBalanceUsers[elementsCreditBalance].totalValue = 0;
                    creditBalanceUsers[elementsCreditBalance].status = "AL DIA";
                    creditBalanceUsers[elementsCreditBalance].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;
                    creditBalanceUsers.splice(elementsCreditBalance, 1);
                    console.log('After update: ', creditBalanceUsers[elementsCreditBalance]);

                    //Actualiza información del usuario que debe
                    let elementOwesUser = owesUsers.findIndex((obj => obj.name = owesUser.name));
                    console.log('Before update: ', owesUsers[elementOwesUser]);
                    owesUsers[elementOwesUser].totalValue = 0;
                    owesUsers[elementOwesUser].status = "AL DIA";
                    owesUsers[elementOwesUser].descriptionPay = 'Felicidades, estas al dia, tu valor a pagar es: ' + 0;
                    owesUsers.splice(elementOwesUser, 1);
                    console.log('After update: ', owesUsers[elementOwesUser]);

                }

            });
            console.log("owesUser:", owesUsers);
            console.log("creditBalanceUser:", creditBalanceUsers);

        });
    
