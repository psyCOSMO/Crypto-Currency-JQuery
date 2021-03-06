var result_arr = [];
var new_subbed_arr = [];
var coin_sub = 0;
var chartInterval = false;
var subbed_arr = [];
var seconds = 0;
var options = {
    animationEnabled: false,
    theme: "light2",
    title: {
        text: "Coin Price Value"
    },
    axisX: {
    },
    axisY: {
        title: "USD",
        titleFontSize: 24,
        includeZero: true
    },
    data: [
        {
            type: "line",
            axisYType: "primary",
            name: '',
            showInLegend: true,
            markerSize: 0,
            dataPoints: [],
        },
        {
            type: "line",
            axisYType: "primary",
            name: '',
            showInLegend: true,
            markerSize: 0,
            dataPoints: []
        },
        {
            type: "line",
            axisYType: "primary",
            name: '',
            showInLegend: true,
            markerSize: 0,
            dataPoints: []
        },
        {
            type: "line",
            axisYType: "primary",
            name: "",
            showInLegend: true,
            markerSize: 0,
            dataPoints: []
        },
        {
            type: "line",
            axisYType: "primary",
            name: '',
            showInLegend: true,
            markerSize: 0,
            dataPoints: []
        },
    ]
};


$("#chartContainer").empty().hide();
$('#aboutContainer').empty().hide();
$('.parallax').hide()
$(document).ready(function () {
    loadingPage()
    $.ajax({
        url: "https://api.coingecko.com/api/v3/coins/list", success: (result) => {
            result_arr = result;
            buildCard(result, 100);
        }
    });
});



buildCard = (result, amount) => {
    $('#homeContainer').empty().show();
    for (let i = 0; i < amount; i++) {
        $('#homeContainer').append(`
        <div class='col-md-3'>
            <div class="card text-white bg-dark mb-1 mt-1 pl-1 pr-1">
                <div class="card-header">
                    <span>${result[i].symbol}</span>
                    <label class="switch">
                        <input class='toggle ${result[i].id}' ${checkArray(result[i].symbol)} type="checkbox" onchange='subToCoin("${result[i].id}")'>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${result[i].name}</h5>
                </div>
                <div class='${result[i].id} moreinfo'></div>
                <button type="button" class="${result[i].id} btn card-button btn-secondary" onclick='showInfo("${result[i].id}")'>Show more</button>
            </div>
        </div>
    `)
    }
    $('.parallax').show()
    loadingPage('done')
}

checkArray = (symbol) => {
    let checked = false;
    subbed_arr.forEach(item => {
        if (item.symbol == symbol) checked = true;
    })
    if (checked) return 'checked';
}

showInfo = (id) => {
    let result_obj = [];
    let today = new Date();
    if ($(`.${id}.btn`).html() == 'Show less') {
        $(`.${id}.btn`).html('Show more')
        $(`.${id}.moreinfo`).empty()
    }
    else {
        $(`.${id}.moreinfo`).html('<img src="assets/loading.gif" class="loadimg" alt="">')
        $(`.${id}.btn`).addClass('disabled')
        result_obj = JSON.parse(sessionStorage.getItem(id));
        if (result_obj && (today.getTime() - result_obj.date) <= 120000) {
            buildMoreInfo(result_obj, id);
        } else {
            sessionStorage.removeItem(id);
            $.ajax({
                url: `https://api.coingecko.com/api/v3/coins/${id}`, success: function (result) {
                    result_obj = {
                        id: result.id,
                        usd_price: result.market_data.current_price.usd,
                        eur_price: result.market_data.current_price.eur,
                        ils_price: result.market_data.current_price.ils,
                        img: result.image.large,
                        date: today.getTime(),
                    }

                    sessionStorage.setItem(result_obj.id, JSON.stringify(result_obj));
                    buildMoreInfo(result_obj, id);
                }
            });
        }
    }

}

buildMoreInfo = (item, id) => {
    $(`.${id}.moreinfo`).html(
        `
    <img src="${item.img}" class="coin-icon mb-3" alt="">
    <div class='ml-1 mt-2' >USD Worth: ${item.usd_price}$</div>
    <div class='ml-1 mt-2'>EUR Worth: ${item.eur_price}$</div>
    <div class='ml-1 mt-2 mb-2'>ILS Worth: ${item.ils_price}$</div>
    `
    )
    $(`.${id}.btn`).removeClass('disabled')
    $(`.${id}.btn`).html('Show less');
}


searchCoin = () => {
    goTo('home');
    event.preventDefault()
    let searched = $('#search_input').val();
    let found = [];
    if (searched == '') { buildCard(result_arr, 100); return }
    for (let i = 0; i < result_arr.length; i++) {
        if (result_arr[i].symbol == searched) {
            found.push(result_arr[i])
            buildCard(found, 1)
            return
        }
    }
    alert(`Couldn't find ${searched}`)
}


subToCoin = (id) => {
    let toggle_btn = $(`.${id}.toggle`);

    if (toggle_btn[0].checked) {
        if (coin_sub == 5) {
            toggle_btn[0].checked = false;
            let modal = $('.modal-body');
            $('#myModal').modal('show')
            modal.empty()
            for (i = 0; i < subbed_arr.length; i++) {
                modal.append(`
                    <div class='row modal-style'>
                    <div class='col-md-3 in-modal'>${subbed_arr[i].symbol}</div>
                    <label class="switch in-modal">
                        <input class='toggle-in-modal' checked type="checkbox" value='false' onchange='modalSub("${subbed_arr[i].id}")'>
                        <span class="slider round"></span>
                    </label>
                    </div>
                `)
            }
        } else {
            for (let i = 0; i < result_arr.length; i++) {
                if (result_arr[i].id == id) {
                    subbed_arr.push(result_arr[i])

                }
            }
            ++coin_sub
        }

    } else {
        for (let i = 0; i < subbed_arr.length; i++) {
            if (subbed_arr[i].id == id) {
                subbed_arr.splice(i, 1)
            }
        }
        --coin_sub
    }
}

modalSub = (id) => {
    let found = false;
    for (let i = 0; i < new_subbed_arr.length; i++) {
        if (new_subbed_arr[i].id == id) {
            new_subbed_arr.splice(i, 1);
            found = true;
            break
        }
    }
    if (!found) {
        for (let i = 0; i < subbed_arr.length; i++) {
            if (subbed_arr[i].id == id) new_subbed_arr.push(subbed_arr[i])
        }
    }

}

saveChange = () => {
    $('.modal-body').html('');
    $('#myModal').modal('hide')
    new_subbed_arr.map(item => {
        $(`.${item.id}.toggle`)[0].checked = false;
        for (let i = 0; i < subbed_arr.length; i++) {
            if (subbed_arr[i].id == item.id) subbed_arr.splice(i, 1);
        }
    });
    coin_sub -= new_subbed_arr.length;
    new_subbed_arr = [];
}

startGraph = () => {
    let searchID = recieveID()
    chartInterval = setInterval(() => {
        $.ajax({
            url: `https://api.coingecko.com/api/v3/simple/price?ids=${searchID}&vs_currencies=usd`,
            success: function (result) {
                let resultArray = Object.values(result);
                let resultArrayKeys = Object.keys(result);
                if (resultArray.length > 0) { newData(resultArray, resultArrayKeys) }
                else {
                    $("#chartContainer").CanvasJSChart(options);
                    loadingPage('done');
                }
            }
        });
    }, 2000);
}
newData = (result, name) => {
    for (let i = 0; i < result.length; i++) {
        options.data[i].name = name[i];
        options.data[i].dataPoints.push({ x: seconds, y: result[i].usd });
    }
    $("#chartContainer").CanvasJSChart(options);
    loadingPage('done')
    seconds += 2;
}

recieveID = () => {
    let addressid = '';
    subbed_arr.forEach((item) => {
        addressid += `%2C${item.id}`
    });
    return addressid;
}


goTo = (where) => {
    loadingPage()
    if (chartInterval) clearInterval(chartInterval);
    $('.parallax').hide()
    $("#chartContainer").empty().hide();
    $('#homeContainer').empty().hide();
    $('#aboutContainer').empty().hide();
    options.data.forEach(item =>{
        item.name = '';
        item.dataPoints = [];
    })
    where == 'home' ? buildHome() : null;
    where == 'graphs' ? buildGraph() : null;
    where == 'about' ? buildAbout() : null;
}

buildHome = () => {
    buildCard(result_arr, 100)
}

buildGraph = () => {
    $("#chartContainer").show()
    seconds = 0;
    startGraph();
}


buildAbout = () => {
    $('#aboutContainer').html(`
    <div class='col-2 mt-5 about_img_wrapper'>
        <img src="assets/avatar.jpg" class="about_img mt-5 col-2"/>
    </div>
    <div class='about_info mt-5 col-10'>
    <h3>Max Fanov</h3>
    <br>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
    Animi vero quidem vel architecto ipsum nisi fugiat officiis, laboriosam quis voluptate?
    </div>
    `).show()
    loadingPage('done')
}

loadingPage = (status) => {
    status ? $('.popout').remove() : $('body').append('<div class="popout"><div class="loadimg-wrapper"><img src="assets/loading.gif" class="loadimg-popout" alt=""></div></div>')
}