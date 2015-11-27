/**
 * Created by wade on 15/11/5.
 */
$(function () {

    var ModalView = Backbone.View.extend({
        el: $('#myModal'),

        event: {
            "click button": "changeColor"
        },
        initialize: function () {
        },
        changeColor: function (e) {
            alert(1);
            console.log(1);
            var color = $(e.target).css('background');
            console.log(color);
        }

    });

    var BModalView = new ModalView;
});