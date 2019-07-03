'use strict';

$(() => {
    
    let conditions = {
        'rain' : 'fas fa-cloud-rain',
        'snow' : 'far fa-snowflake',
        'clear' : 'fas fa-sun',
        'cloud' : 'fas fa-cloud-meatball',
        'fog' : 'fas fa-smog',
        'default' : 'fas fa-rainbow'
    }

    let zips = [];

    let time;

    function main() {
        let zipCode = getZipCode();
        if (zipCode == undefined || zips.includes(zipCode)) {
            alert('Cannot add duplicate zip codes.');
            return;
        }
        zips.push(zipCode);
        getWeatherData(zipCode); 
    }

    function refresh() {
        for (let i = 0; i < zips.length; i++) {
            getWeatherData(zips[i], 'refresh');
        }
        $('#refresh_indicator').removeClass('no_indicator').addClass('indicator').delay(500).queue(function(next) {
            $(this).removeClass('indicator').addClass('no_indicator');
            next();
        });
    }

    function getWeatherData(zipCode, buttonType) {
        let url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},us&units=imperial&appid=9acbb1187ce914eccb126efd89ebfe89`;
        let promise = $.getJSON(url);
        promise.then(
            data => {
                let timezoneDifference = data.timezone;
                time = new Date((data.dt + timezoneDifference) * 1000);
                let temperature = data.main.temp;
                let weatherDescription = data.weather[0].description;
                createSlide(zips.indexOf(zipCode), temperature, weatherDescription, time, buttonType);
                console.log(data);
            },
            error => {
                console.log(error);
                alert('Zip code not found.');
            }
        );    
    }
    
    function getZipCode() {
        let zip = $('#zip_input_div__input').val();
        clearInput();
        if (zip.length == 5) {
            return zip;
        }
        else {
            alert('Enter a 5-digit US zip code.');
            return undefined;
        }
    }
    
    function clearInput() {
        $('#zip_input_div__input').val('');
        $('#zip_input_div__input').attr('placeholder', 'enter a US zip code');
    }

    function createSlide(zipIndex, temperature, weatherDescription, time, buttonType) {
        let active = 'active';
        if (buttonType == 'refresh') {
            active = '';
        }
        if (buttonType == 'refresh' && zipIndex == 0) {
            $('#weather_carousel__inner > div').not('div:first').remove();
            $('#weather_carousel__indicators > li').not('li:first').remove();
        }
        $('#main_slide').removeClass(active);
        $('#main_indicator').removeClass(active);
        zipIndex++;
        let indicator = `<li data-target='#weather_carousel' data-slide-to='${zipIndex}' class='${active}'></li>`;
        let slide = `<div class='carousel-item ${active}'>
                        <div class='container text-white  min-vh-100 main_item'>
                            <div class='row'>
                                <p id='current_zip${zipIndex}'>${zips[zipIndex - 1]}</p>
                            </div>
                            <div class='row'>
                                <div id='time${zipIndex}'>
                                    <p id='current_time${zipIndex}'>--:--</p>
                                </div>
                            </div>
                            <div class='row'>
                                <div id='weather${zipIndex}'>
                                    <p id='current_weather${zipIndex}'>
                                        <i id='weather_icon${zipIndex}' class='fas fa-rainbow'></i>
                                        <p id='weather_temperature${zipIndex}'>--<span>&#176;</span></p>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>`;
        $('#weather_carousel__indicators').append(indicator);
        $('#weather_carousel__inner').append(slide);
        $(`#weather_temperature${zipIndex}`).html(Math.round(temperature) + '<span>&#176;</span>');
        let icon;
        if (weatherDescription.includes('clear')) {
            icon = conditions.clear;
        }
        else if (weatherDescription.includes('rain')) {
            icon = conditions.rain;
        }
        else if (weatherDescription.includes('snow')) {
            icon = conditions.snow;
        }
        else if (weatherDescription.includes('cloud')) {
            icon = conditions.cloud;
        }
        else if (weatherDescription.includes('fog')) {
            icon = conditions.fog;
        }
        else {
            icon = conditions.default;
        }
        $(`#weather_icon${zipIndex}`).attr('class', icon);
        displayTime(zipIndex, time);
    }

    function displayTime(zipIndex, time) {
        time.setUTCSeconds(time.getUTCSeconds() + 10);
        let hours = time.getUTCHours();
        if (hours < 10) { hours = '0' + hours; }
        let minutes = time.getUTCMinutes();
        if (minutes < 10) { minutes = '0' + minutes; }
        $(`#current_time${zipIndex}`).html(`${hours}:${minutes}`);
    }

    $('#zip_input_button').click(main);

    $('#refresh_button').click(refresh);

});