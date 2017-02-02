document.addEventListener('DOMContentLoaded', function () {
    //TODO: capture this value in a header from the initial response
    var BACK_END_URL = "http://suadeomejvm-jcsantosbr.rhcloud.com"
    var PAGE = {
        $recommendationTypes: document.querySelector('[data-recommendation-types]'),
        $notification : document.getElementById("notification_panel"),
        $formAddRecommendation: document.getElementById("form_add_recommendation"),
        $submitRecommendation: document.getElementById("btn_add_recommendation"),
        $formSearchRecommendation: document.getElementById("form_search_recommendation"),
        $searchRecommendation: document.getElementById("btn_search_recommendation")
    };

    var state = {
        notification: { message: "", type: ""},
        searchResult: []
    }

    var toggleRecommendationTypeClass = function () {
        var selectedType = this.options[this.selectedIndex].value;
        this.className = selectedType === 'none' ? 'RecomendationType' : 'RecomendationType--active';
    };

    var notify = function (notificationType, message ) {
        state.notification.message = message;
        state.notification.type = notificationType;
        render(PAGE);
        setTimeout(function() {
            state.notification.message = "";
            state.notification.type = "";
            render(PAGE);
        }, 3000);

    }

    var notifySuccess = function (message) {
        notify('success_notification', message)
    }

    var notifyFailure = function (message) {
        notify('failure_notification', message)
    }


    var addRecomendation = function (form) {
        var professional = {
            service: form["service"].value,
            name: form["name"].value,
            phone: form["phone"].value
        };

        fetch(BACK_END_URL + '/professionals', {
            method: 'post',
            body: JSON.stringify(professional),
            mode: 'cors'
        }).then(function (response) {
            if ( response.ok ) {
                response.json().then(function(p) {
                    notifySuccess("Você recomendou " + p.name + "!");
                })
            } else {
                notifyFailure("Você tentou recomendar [" + professional.name + "], mas algo deu errado!");
            }
        }, function (err) {
            notifyFailure("Você tentou recomendar [" + professional.name + "], mas algo deu errado!");
            console.log(err)
        });
    }

    var searchRecomendation = function (form) {
        var query = {
            service: form["service"].value
        }

        fetch(BACK_END_URL + '/professionals?service=' + query.service, {
            method: 'GET',
            mode: 'cors'
        }).then(function (response) {
            if ( response.ok ) {
                response.json().then(function(searchResult) {
                    if ( searchResult && searchResult.length ) {
                        state.searchResult = searchResult;
                        var names = searchResult.map(function(e) { return e.name;  });
                        notifySuccess("Você encontrou serviços: " + names);
                        render(PAGE);
                    }
                })
            } else {
                notifyFailure("Você tentou procurar [" + query.service + "], mas algo deu errado!");
            }
        }, function (err) {
            notifyFailure("Você tentou procurar, mas algo deu errado!");
            console.log(err)
        });



    }

    var render = function (page) {

        //process notifications
        if ( state.notification.message ) {
            page.$notification.classList = [ state.notification.type ];
            page.$notification.innerText =  state.notification.message;
        } else {
            page.$notification.classList = [];
            page.$notification.innerText = "";
        }
    }

    var init = function (page) {
        page.$recommendationTypes.addEventListener('change', toggleRecommendationTypeClass);
        page.$submitRecommendation.addEventListener('click', function() {addRecomendation(page.$formAddRecommendation)});
        page.$searchRecommendation.addEventListener('click', function() {searchRecomendation(page.$formSearchRecommendation)});
    };

    init(PAGE);
});
