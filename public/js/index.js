new Vue({
    el: '#app',
    data: {
        events: [],
        pop: {}
    },
    methods: {
        getEvents: function() {
            var vthis = this
            $.ajax({
                dataType: "jsonp",
                url: "https://bsno.dylannz.com/api/events"
            }).done(function(data) {
                vthis.events = data.event;
                vthis.events.forEach(function (d) {
                    var date = new Date(d.created_at);
                    d.created_at = date.toLocaleDateString("en-AU");
                    d.url = "/events/" + d.id;
                })
            })
        },
        getPop: function() {
            var vthis = this
            $.ajax({
                dataType: "jsonp",
                url: "https://bsno.dylannz.com/api/current_players"
            }).done(function (pop) {
                vthis.pop = pop
            })
        }
    },
    beforeMount: function() {
        this.getEvents()
        this.getPop()
    }
})