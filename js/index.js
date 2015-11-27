$(document).ready(function () {

    $(".toggler").click(function () {
        var $sider = $('.page-side');
        var $open = $('#open');
        var openSider = $open.val();
        if (openSider === 'true') {
            $sider.animate({left: -$sider.width()});
            $('#open').val(false);
            $('.glyphicon-chevron-right').show();
            $('.glyphicon-chevron-left').hide();
            $('.business-body').css('margin-left', 'auto');
        }
        else {
            $('.glyphicon-chevron-right').hide();
            $('.glyphicon-chevron-left').show();
            $sider.animate({left: '0px'});
            $('#open').val(true);
            var bodyWidth = $sider.width() + 10;
            $('.business-body').animate({'margin-left': bodyWidth});
        }

    });
    $('#add-canvas').click(function () {
        location.href = '';
    });

    $('#in-canvas').click(function () {
        $('#inModal').modal('show');
    });
    $('#in-btn').click(function () {
        var id = $('#inId').val();
        if (id) {
            location.href = '#search/' + id;
            $('#inModal').modal('hide');
        }
    });

    $(".toggler").click();
});

$(function () {
    var Item = Backbone.Model.extend({
        defaults: function () {
            return {
                title: "",
                order: Items.nextOrder(),
                status: false,
                type: "",
                ps: "",
                colors: ""
            };
        },
        toggle: function (color) {
            this.save({colors: color});
        }
    });

    var ItemList = Backbone.Collection.extend({


        model: Item,

        localStorage: new Backbone.LocalStorage("items-backbone"),

        nextOrder: function () {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        comparator: 'order'

    });

    var Items = new ItemList;

    var ItemView = Backbone.View.extend({

        tagName: 'li',

        className: 'animated zoomIn',

        template: _.template($('#item-template').html()),

        events: {
            "click .b-item": "edit",
            "click button.destroy": "clear",
            "dblclick .b-item": "back",
            "keypress .edit": "updateOnEnter",
            "blur .edit": "close",
            "change .change-color": "changeColor"
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function () {

            this.$el.html(this.template(this.model.toJSON()));
            $('[data-toggle="popover"]').popover();
            this.$('.title-text').addClass('edit');
            return this;
        },

        back: function (e) {
            e.stopPropagation();
        },
        edit: function (e) {
            new NoteModifyView({model: this.model});
            e.stopPropagation();
            return false;
        },

        close: function () {
            var value = this.$('.title-text').val();
            if (!value)
                this.clear();
            else {
                this.model.save({title: value});
                this.$el.removeClass("editing");
            }
        },

        updateOnEnter: function (e) {
            if (e.keyCode == 13) this.close();
        },

        clear: function () {
            this.model.destroy();
        },
        changeColor: function () {
            this.model.save({colors: (this.$('.change-color').val())});
        }

    });


    var NoteModifyView = Backbone.View.extend({
        initialize: function () {
            this.render();
        },
        className: 'modal fade',
        id: 'editModal',
        events: {
            'hidden': 'remove',
            'hidden.bs.modal': 'remove',
            'click :submit': 'submit',
            'click :reset': 'cancel',
            "click button.btn-color": "changeColor",
            "click .add-ps": "showPs",
            "shown.bs.modal .modal": "focus"

        },
        template: function (note) {
            var template = '' +
                '<div class="modal-dialog modal-sm" style="margin-top: 250px">' +
                '<div class="modal-content" style="background-color: {{colors}}; ">' +
                '<div class="modal-body">' +
                '<textarea id="editText" class="new-item" rows="3" style="width: 100%; background: transparent; border: 1px solid #cccccc" maxlength="200"' +
                'data-type="important" autofocus>{{title}}</textarea>' +
                '<input type="hidden" id="editColor" value="{{colors}}">' +
                '<div class="btn-group" role="group">' +
                '<button type="button" class="btn btn-default btn-color"' +
                'style="background: rgb(246,245,223);">' +
                '</button>' +
                '<button type="button" class="btn btn-default btn-color"' +
                'style="background: rgb(237,197,202);">' +
                '</button>' +
                '<button type="button" class="btn btn-default btn-color" ' +
                'style="background: rgb(77,152,188);">' +
                '</button>' +
                '<button type="button" class="btn btn-default btn-color"' +
                'style="background: rgb(148,197,218);">' +
                '</button>' +
                '<button type="button" class="btn btn-default btn-color"' +
                'style="background: rgb(223,221,238);">' +
                '</button>' +
                '</div>' +
                '<div>' +
                '<a href="javascript:void(0)" class="add-ps">点击添加注释</a>' +
                '<textarea name="ps" id="psEdit" class="psText" rows="3">{{ps}}</textarea>' +
                '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                '<button type="submit" class="btn btn-primary" id="edit-btn">Save</button>' +
                '</div>' +
                '</div>';
            return Mustache.to_html(template, note);
        },
        render: function () {
            $(this.el).html(this.template(typeof(this.model) != 'undefined' ? this.model.toJSON() : {})).modal({
                keyboard: true,
                show: true
            }).appendTo($('body'));

            return this;
        },

        showPs: function () {
            $('.psText', this.el).toggle();
        },
        focus: function () {
            $('textarea', this.el).focus();
        },

        changeColor: function (e) {
            var color = $(e.target).css('background-color');
            $('.modal-content', this.el).css('background-color', color);
            $('#editColor').val(color);
        },
        remove: function (event) {
            event.stopPropagation();
            $(this.el).remove();
        },
        submit: function (e) {
            var title = $('#editText', this.el).val();
            var ps = $('#psEdit').val();
            var color = $('#editColor', this.el).val().length !== 0 ? $('#editColor', this.el).val() : '#ffc';
            if (title && color) {
                this.model.save({title: title, colors: color, ps: ps})
                $(this.el).modal('hide');
            }
        },
        cancel: function () {
            $(this.el).modal('hide');
        }
    });


    var BusinessView = Backbone.View.extend({
        el: $('#business-app'),

        events: {
            "keypress .new-item": "createOn",
            "click #save-btn": "createOnClick",
            "click .add-btn": "addInput",
            "click .business-box": "addInput",
            "click #upload-btn": "uploadOnClick",
            "click #del-btn": "delOnClick",
            "click button.btn-color": "changeColor",
            "click a.add-ps": "showPs",
            "click #name": "editTitle",
            "blur #name-text": "closeT",
            "keypress #name-text": "closeTKey",
            "click .version": "editVersion",
            "keypress #version-text": "closeVKey",
            "blur #version-text": "closeV",
            "shown.bs.modal .modal": "focus"
        },

        initialize: function () {
            this.input = this.$('.new-item');
            this.listenTo(Items, 'add', this.addOne);
            this.listenTo(Items, 'reset', this.clearReset);

            //Items.fetch();
        },

        clearReset: function () {
            return false;
        },


        focus: function () {
            $('#myText').val('');
            $('textarea', this.el).focus();
        },
        showPs: function () {
            $('.psText').toggle();
        },

        addInput: function (e) {
            if (e.target.nodeName == 'BUTTON')
                return;

            var myId = typeof $(e.target).find('.item-list').attr('id') === 'undefined' ? $(e.target).next('.item-list').attr('id') : $(e.target).find('.item-list').attr('id');
            $('#myModal').modal('show');
            $('#myText').attr('data-type', myId);
            return false;
        },


        editTitle: function () {
            $('.title-name').addClass('editing');
            $('#name-text').val($('#name').text());
            $('#name-text').focus();
            return;
        },

        closeT: function () {
            var value = this.$('#name-text').val();
            if (value)
                $('#name').text(value);
            $('.editing').removeClass("editing");
            return false;
        },

        closeTKey: function (e) {
            if (e.keyCode !== 13) return;
            this.closeT();
        },
        closeVKey: function (e) {
            if (e.keyCode !== 13) return;
            this.closeV();
        },
        editVersion: function () {
            $('.version').addClass('editing');
            $('#version-text').val($('#version').text());
            $('#version-text').focus();
            return;
        },

        closeV: function () {
            var value = this.$('#version-text').val();
            if (value)
                $('#version').text(value);
            $('.editing').removeClass("editing");
            return false;
        },
        addOne: function (item) {
            var view = new ItemView({model: item});
            this.$('#' + item.get('type')).append(view.render().el);
        },
        changeColor: function (e) {
            var color = $(e.target).css('background-color');
            $('#myModal .modal-content', this.el).css('background-color', color);
            $('#myColor').val(color);
        },

        createOn: function (e) {
            if (e.keyCode !== 13) return;
            this.createOnClick();
        },

        createOnClick: function () {
            var $myText = $('#myText');
            if ($myText.val().length == 0) return;
            Items.create({
                title: $myText.val(),
                type: $myText.attr('data-type'),
                colors: $('#myColor').val(),
                ps: $('#psText').val()
            });
            $myText.val('');
            $('#psText').val('');
            $('#myColor').val('rgb(246,245,223)');
            $('#myModal').modal('hide');
        },
        uploadOnClick: function () {
            var hashId = location.hash.split('/')[1];
            var datas = {
                userId: 1,
                objectStr: JSON.stringify(Items.toJSON()),
                remark: $('#version').text(),
                name: $('#name').text()
            };
            if (!Items.size()) {
                $('#alertText').html('请创建你的画布');
                $('#alertModal').modal('show');
                return false;
            }
            if (typeof(hash) !== undefined) {
                datas.id = hashId;
            }
            $.ajax({
                url: 'http://101.231.124.8:45698/reindeerjob_kit/businessMap/',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(datas),
                success: function (response) {
                    var String = '<span style="font-size: 24px">' + response.id + '</span>';
                    $('#alertText').html('保存成功! 画布ID为 ' + String);
                    $('#alertModal').modal('show');
                    location.href = '#search/' + response.id;
                }
            })

        },

        delOnClick: function () {
            localStorage.clear();
            location.reload();
        }


    });

    var App = new BusinessView;

    var BRouter = Backbone.Router.extend({
        routes: {
            "search/:query": "search"
        },
        search: function (query) {
            $.get('http://101.231.124.8:45698/reindeerjob_kit/businessMap/' + query, function (response) {
                Items.reset();
                if (_.isEmpty(response)) {
                    $('#alertText').html('没有这个画布哦!');
                    $('#alertModal').modal('show');
                    location.href = '';
                    return;
                }
                $('.item-list').html('');
                var bItems = JSON.parse(response.objectStr);
                if (response.name)
                    $('#name').text(response.name);
                else
                    $('#name').text('标题');
                if (response.remark)
                    $('#version').text(response.remark);
                else
                    $('#version').text('版本号');
                $.each(bItems, function (n, bItem) {
                    Items.add(bItem);
                    $('[data-toggle="popover"]').popover();
                });


                var storage = window.sessionStorage;
                if (!storage.getItem('menus' + response.id)) {
                    var counts = [];
                    if (storage.getItem("canvasCount")) {
                        counts = JSON.parse(storage.getItem("canvasCount"));
                    }
                    counts.push(response.id);
                    storage.setItem("canvasCount", JSON.stringify(counts));
                }
                sessionStorage.setItem('menus' + response.id, JSON.stringify(response));
            });
        }
    });

    var BusinessRouter = new BRouter;
    Backbone.history.start();
    if (!sessionStorage.getItem('canvasCount'))return false;
    var count = JSON.parse(sessionStorage.getItem('canvasCount'));
    $('#my-canvas').html('');
    for (var i = 0; i < count.length; i++) {
        var menu = JSON.parse(sessionStorage.getItem('menus' + count[i]));
        $('#my-canvas').append('<li class="canvas-li"><a href="#search/' + menu.id + '"><span class="glyphicon glyphicon-file"></span><span>' + menu.name + '</span></a></li>');
    }

});
