new Vue({
    el: '#app',
    data: {
        events: [],
        pop: {}
    },
    methods: {
        getEvents: function() {
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: "/api/events"
            }).done(function(data) {
                vthis.events = data;
                vthis.events.forEach(function (d) {
                    var date = new Date(d.created_at);
                    d.created_at = date.toLocaleDateString("en-AU");
                    d.url = "/events?id=" + d.id;
                })
            })
        },
        getPop: function() {
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: "/api/population"
            }).done(function (pop) {
                vthis.pop = pop
            })
        }
    },
    beforeMount: function() {
        this.getEvents();
        this.getPop();
    }
});