/*!
 * This is open-source. Which means that you can contribute to it, and help
 * make it better! Also, feel free to use, modify, redistribute, and so on.
 *
 * If you are going to edit the code, always work from the source-code available for download at
 * https://github.com/jhcp/pistar
 */
var elementList = [
    {constructsApplie:["Actor"], name:"Actor"},
    {constructsApplie:["Agent"], name:"Agent"},
    {constructsApplie:["Role"], name:"Role"},
    {constructsApplie:["Task"], name:"Task"},
    {constructsApplie:["Goal"], name:"Goal"},
    {constructsApplie:["Quality"], name:"Quality"},
    {constructsApplie:["Resource"], name:"Resource"},
    {constructsApplie:["AndRefinementLink"], name:"And-Refinement Link"},
    {constructsApplie:["OrRefinementLink"], name:"Or-Refinement Link"},
    {constructsApplie:["NeededByLink"], name:"Needed By Link"},
    {constructsApplie:["QualificationLink"], name:"Qualification Link"},
    {constructsApplie:["ContributionLink"], name:"Contribution Link"},
    {constructsApplie:["DependencyLink"], name:"Dependency Link"},
    {constructsApplie:["IsALink"], name:"Is A Link"},
    {constructsApplie:["ParticipatesInLink"], name:"Participates In Link"}
];
var mapNameToType = {
    "Actor" : "Actor",
    "Agent": "Agent",
    "Role" : "Role",
    "Task" : "Task",
    "Goal" : "Goal",
    "Quality" : "Quality",
    "Resource" : "Resource",
    "And-Refinement Link": "AndRefinementLink",
    "Or-Refinement Link" : "OrRefinementLink",
    "Needed By Link" : "NeededByLink",
    "Qualification Link" : "QualificationLink",
    "Contribution Link" : "ContributionLink",
    "Dependency Link" : "DependencyLink",
    "Is A Link" : "IsALink",
    "Participates In Link" : "ParticipatesInLink"
};
var stereotype_list = [];
var taggedvalue_list = [];
var group_list = [];

ui.components = ui.components || {};  //prevents overriding the variable, while also preventing working with a null variable

ui.components.PropertiesTableView = Backbone.View.extend({
    template: _.template($('#property-template').html()),
    trTemplate: _.template($('#tr-template').html()),
    selectTemplate: _.template($('#select-template').html()),
    extensionTemplate: _.template($('#extension-template').html()),
    initialize: function () {
        'use strict';

        this.$table = $('#properties-table');
        this.$tableExtension = $('#extension-table');

        this.listenTo(this.model, 'mouseup', this.render);
        this.listenTo(this.model, 'change:customProperties', this.render);
        this.listenTo(this.model, 'change:name', this.render);
    },    
    render: function () {
        'use strict';

        this.renderElementName();
        this.setupElementNameEditing();
//Change: begin
        this.renderElementStereotype();
        this.setupElementStereotypeEditing();
        this.renderElementTaggedValue();
        this.setupElementTaggedValueEditing();
//Change: end
        this.renderElementType();
        this.setupElementTypeEditing();
        for (var propertyName in this.model.prop('customProperties')) {
            this.renderCustomProperty(propertyName);
            this.setupCustomPropertyEditing(propertyName);
        }

        this.setupAddPropertyButton();
//Change: begin
        this.setupAddStereotypeButton();
        this.setupAddTaggedValueButton();
        this.setupAddGroupButton();
//Change: end

        this.clearOptionsPanel();
        if (this.model.isElement() || this.model.isLink()) {
            if (this.model.isKindOfActor()) {
                this.setupCollapseExpandButton();
            }
            else if (this.model.isDependum()) {
                this.setupChangeDirectionButton();
            }
            else if (this.model.isLink()) {
                this.setupClearVerticesButton();
            }
            this.setupDeleteButton();
            this.$tableExtension.show();
        }else{
            this.$tableExtension.hide();
        }
        this.setupOptionsPanel();

        if ($.trim($('#cell-actions').html())) {
            $('#sidepanel-title-actions').show();
        }
        else {
            $('#sidepanel-title-actions').hide();
        }

        return this;
    },

    renderElementName: function () {
        'use strict';

        this.$table.find('tbody').html(this.template({
            propertyName: 'Name',
            propertyValue: this.model.prop('name'),
            dataType: 'text'
        }));
    },
//Change: begin
    renderElementStereotype: function () {
        'use strict';
        this.$tableExtension.find('tbody').html(this.extensionTemplate({
            propertyName: 'Stereotype',
            propertyValue: this.model.prop('stereotype'),
            dataType: 'text'
        }));

        this.$tableExtension.find("#currentStereotype").val(this.model.prop('stereotype'));

        this.$tableExtension.find("#selectStereotype").empty();
        this.$tableExtension.find("#selectStereotype").append('<option value="">Not Used</option>');
        this.$tableExtension.find("#selectStereotype").append('<option value="New Value">New Value</option>');
        stereotype_list.forEach((item)=>{
            if(item.constructsApplie.find((item)=>(item==this.model.attributes.type)))
                this.$tableExtension.find("#selectStereotype").append('<option value="'+item.name+'">'+item.name+'</option>');
        });
        this.$tableExtension.find("#selectStereotype").val(this.model.prop('selectedStereotype'));
    },
    renderElementTaggedValue: function () {
        'use strict';
        this.$tableExtension.find('tbody').append(this.extensionTemplate({
            propertyName: 'TaggedValue',
            propertyValue: this.model.prop('taggedValue'),
            dataType: 'text'
        }));

        this.$tableExtension.find("#currentTaggedValue").val(this.model.prop('taggedValue'));

        this.$tableExtension.find("#selectTaggedValue").empty();
        this.$tableExtension.find("#selectTaggedValue").append('<option value="">Not Used</option>');
        this.$tableExtension.find("#selectTaggedValue").append('<option value="_new_value">New Value</option>');
        this.$tableExtension.find("#selectTaggedValue").append('<option value="Id">Id</option>');
        this.$tableExtension.find("#selectTaggedValue").append('<option value="Reference to">Reference to</option>');
        this.$tableExtension.find("#selectTaggedValue").append('<option value="Status">Status</option>');
        this.$tableExtension.find("#selectTaggedValue").append('<option value="Logic">Logic</option>');

        taggedvalue_list.forEach((item)=>{
            if(item.constructsApplie.find((item)=>(item==this.model.attributes.type)))
                this.$tableExtension.find("#selectTaggedValue").append('<option value="'+item.name+'">'+item.name+'</option>');
        });
        this.$tableExtension.find("#selectTaggedValue").val(this.model.prop('selectedTaggedValue'));
    },
//Change: end
    renderElementType: function () {
        'use strict';

        if (this.model.prop('type')) {
            var propertyName = null;
            if (this.model.isDependum && this.model.isDependum()) {
                propertyName = 'type';
            }
            else if (this.model.isContributionLink && this.model.isContributionLink()) {
                propertyName = 'value';
            }
            if (propertyName) {
                this.$table.find('tbody').append(this.template({
                    propertyName: _.capitalize(propertyName),
                    propertyValue: this.model.prop(propertyName),
                    dataType: 'select'
                }));
            }
        }
    },
    setupElementNameEditing: function () {
        'use strict';

        var currentElementModel = this.model;
        this.$table.find('a').editable({
            showbuttons: 'bottom',
            success: function (response, newValue) {
                currentElementModel.prop('name', newValue);
//Change: begin 
                if(currentElementModel.isElement()){
                    currentElementModel.updateLineBreak();
                }
//Change: end
                return {newValue: currentElementModel.prop('name')};
            }
        })
            .on('shown', function () {
                ui.states.editor.transitionTo(ui.states.editor.EDITING_TEXT);
            })
            .on('hidden', function () {
                ui.states.editor.transitionTo(ui.states.editor.VIEWING);
            });
    },
//Change: begin
    updateLinkLabel: function (){
        let label = '';
        if(this.model.attributes.type == 'IsALink' || this.model.attributes.type == 'ParticipatesInLink')
            label += this.model.attributes.type;
        let stereotype = this.model.prop("stereotype");
        let taggedValue = this.model.prop("taggedValue");
        let selectedTaggedValue = this.model.prop('selectedTaggedValue');
        let linkLabel = '';
        if(stereotype){
            linkLabel += '<<'+stereotype+'>>\n';
        }
        if(selectedTaggedValue){
            if(selectedTaggedValue == '_new_value')
                linkLabel += '{'+(taggedValue||'')+'} ';
            else
                linkLabel += '{'+selectedTaggedValue+"="+(taggedValue||'')+'} ';
        }
        linkLabel += label;
        this.model.attr('label/text', linkLabel);
        this.model.attr('label-background/text', linkLabel);
    },
    setupElementStereotypeEditing: function () {
        'use strict';
        
        var currentElementModel = this.model;
        var selectStereotype = this.$tableExtension.find('#selectStereotype');
        selectStereotype.change((e) => {
            currentElementModel.prop('stereotype', e.target.value);
            currentElementModel.prop('selectedStereotype', e.target.value);
            if(currentElementModel.isElement()){
                currentElementModel.updateLineBreak();
            }else{
                this.updateLinkLabel();
            }
            this.render();
        });
        this.$tableExtension.find('#currentStereotype').editable({
            showbuttons: 'bottom',
            success: (response, newValue) => {
                currentElementModel.prop('selectedStereotype', 'New Value');
                currentElementModel.prop('stereotype', newValue);
                selectStereotype.val('New Value');
                if(currentElementModel.isElement()){
                    currentElementModel.updateLineBreak();
                }else{
                    this.updateLinkLabel();
                }    
                return {newValue: currentElementModel.prop('stereotype')};
            }
        })
        .on('shown', function () {
            ui.states.editor.transitionTo(ui.states.editor.EDITING_TEXT);
        })
        .on('hidden', function () {
            ui.states.editor.transitionTo(ui.states.editor.VIEWING);
        });
    },
    setupElementTaggedValueEditing: function () {
        'use strict';

        var currentElementModel = this.model;
        var selectTaggedValue = this.$tableExtension.find('#selectTaggedValue');
        selectTaggedValue.change((e) => {
            currentElementModel.prop('selectedTaggedValue', e.target.value);
            if(e.target.value == '')
                currentElementModel.prop('taggedValue', '');
            if(currentElementModel.isElement()){
                currentElementModel.updateLineBreak();
            }else{
                this.updateLinkLabel();
            }    
            this.render();
        });
        this.$tableExtension.find('#currentTaggedValue').editable({
            showbuttons: 'bottom',
            success: (response, newValue) => {
                currentElementModel.prop('taggedValue', newValue);
                if(currentElementModel.isElement()){
                    currentElementModel.updateLineBreak();
                }else{
                    this.updateLinkLabel();
                }    
                return {newValue: currentElementModel.prop('taggedValue')};
            }
        })
        .on('shown', function () {
            ui.states.editor.transitionTo(ui.states.editor.EDITING_TEXT);
        })
        .on('hidden', function () {
            ui.states.editor.transitionTo(ui.states.editor.VIEWING);
        });
    },
//Change: end
    setupElementTypeEditing: function () {
        'use strict';

        if (this.model.isDependum && this.model.isDependum()) {
            var typeNames = [];
            var currentType = 0;
            var element = this.model;
            _.forEach(istar.metamodel.nodes, function(nodeType, index) {
                typeNames.push({value: index, text: nodeType.name});
                if (nodeType.name === element.prop('type')) {
                    currentType = index;
                }
            }, this);
            this.$table.find('a').editable({
                showbuttons: false,
                source: typeNames,
                success: function (response, newValue) {
                    var updatedElement = ui.getSelectedCells()[0];
                    var newType = istar.metamodel.nodes[newValue].name;
                    updatedElement.prop('type', newType);
                    var newNode = istar.replaceNode(updatedElement, istar.metamodel.nodes[newValue].name)
                        .prop('isDependum', true);
                    ui.selectCell(newNode);
                    ui.collectActionData('edit', 'change', 'change dependum type');
                },
                value: currentType
            })
                .on('shown', function () {
                    ui.states.editor.transitionTo(ui.states.editor.EDITING_TEXT);
                })
                .on('hidden', function () {
                    ui.states.editor.transitionTo(ui.states.editor.VIEWING);
                });
        }
        else if (this.model.isContributionLink && this.model.isContributionLink()) {
            var element = this.model;
            var contributionMetamodel = istar.metamodel.nodeLinks.ContributionLink;
            var valueNames = contributionMetamodel.possibleLabels;
            // var currentType = _.findIndex(valueNames, function(o) { return o === element.prop('value'); });
            this.$table.find('a').editable({
                showbuttons: false,
                source: valueNames,
                success: function (response, newValue) {
                    ui.getSelectedCells()[0].prop('value', newValue);
                    ui.collectActionData('edit', 'change', 'change contribution value');
                },
                value: element.prop('value')
            })
                .on('shown', function () {
                    ui.states.editor.transitionTo(ui.states.editor.EDITING_TEXT);
                })
                .on('hidden', function () {
                    ui.states.editor.transitionTo(ui.states.editor.VIEWING);
                });
        }
        // else {
        //     this.$table.find('a').editable({
        //         disabled: true,
        //     });
        // }
    },
//Change: begin
    setupAddStereotypeButton: function () {
        'use strict';
        $('#add-stereotype-select').html('');
        let id = 0;
        elementList.forEach(item => {
            $('#add-stereotype-select').append('<option value="'+id+'">'+item.name+'</option>');
            id++;
        });
        group_list.forEach(item => {
            $('#add-stereotype-select').append('<option value="'+id+'">'+item.name+'</option>');
            id++;
        });

        id = 0;
        var trTemplate = this.trTemplate;
        $("#stereotype-table").find('tbody').html('');
        stereotype_list.forEach(item => {
            $("#stereotype-table").find('tbody').append(trTemplate({
                first: item.name,
                second: item.groupName,
                id: id
            }));
            id++;
        });
        $("#stereotype-table").find('tbody').find('button').click((e) => {
            stereotype_list.splice(e.target.id, 1);
            this.render();
        });
        $('#add-stereotype-button-area').html('<button id="add-stereotype-button" type="button" class="btn btn-primary">Add</button>');
        $('#add-stereotype-button').click(() => {
            let name = $('#add-stereotype-input')[0].value;
            let id = $('#add-stereotype-select')[0].value;
            let constructsApplie, groupName;
            if(id < elementList.length){
                constructsApplie = elementList[id].constructsApplie;
                groupName = elementList[id].name;
            }else{
                constructsApplie = group_list[id-elementList.length].constructsApplie;
                groupName = group_list[id-elementList.length].name;
            }
            stereotype_list.push({name, constructsApplie, groupName});
            $('#add-stereotype-input').val('');
            $('#add-stereotype-select').val('');
            this.render();
        });
    },
    setupAddTaggedValueButton: function () {
        'use strict';
        let id = 0;
        $('#add-taggedvalue-select').html('');
        elementList.forEach(item => {
            $('#add-taggedvalue-select').append('<option value="'+id+'">'+item.name+'</option>');
            id++;
        });
        group_list.forEach(item => {
            $('#add-taggedvalue-select').append('<option value="'+id+'">'+item.name+'</option>');
            id++;
        });

        id = 0;
        var trTemplate = this.trTemplate;
        $("#taggedvalue-table").find('tbody').html('');
        taggedvalue_list.forEach(item => {
            $("#taggedvalue-table").find('tbody').append(trTemplate({
                first: item.name,
                second: item.groupName,
                id: id
            }));
            id++;
        });
        $("#taggedvalue-table").find('tbody').find('button').click((e) => {
            taggedvalue_list.splice(e.target.id, 1);
            this.render();
        });

        $('#add-taggedvalue-button-area').html('<button id="add-taggedvalue-button" type="button" class="btn btn-primary">Add</button>');
        $('#add-taggedvalue-button').click(()=> {
            let name = $('#add-taggedvalue-input')[0].value;
            let id = $('#add-taggedvalue-select')[0].value;
            let constructsApplie, groupName;
            if(id < elementList.length){
                constructsApplie = elementList[id].constructsApplie;
                groupName = elementList[id].name;
            }else{
                constructsApplie = group_list[id-elementList.length].constructsApplie;
                groupName = group_list[id-elementList.length].name;
            }
            taggedvalue_list.push({name, constructsApplie, groupName});
            $('#add-taggedvalue-input').val('');
            $('#add-taggedvalue-select').val('');
            this.render();
        });
    },
    setupAddGroupButton: function () {
        'use strict';
        $('#add-group-select').html('');
        elementList.forEach(item => {
            $('#add-group-select').append('<option value="'+item.name+'">'+item.name+'</option>');
        });

        let id = 0;
        var trTemplate = this.trTemplate;
        $("#group-table").find('tbody').html('');
        group_list.forEach(item => {
            $("#group-table").find('tbody').append(trTemplate({
                first: item.name,
                second: item.constructsApplie,
                id: id
            }));
            id++;
        });
        $("#group-table").find('tbody').find('button').click((e) => {
            group_list.splice(e.target.id, 1);
            this.render();
        });

        $('#add-group-button-area').html('<button id="add-group-button" type="button" class="btn btn-primary">Add</button>');
        $('#add-group-button').click(()=>{
            let name = $('#add-group-input')[0].value;
            let constructsApplie = [];
            let selectedList = $('#add-group-select')[0].selectedOptions;
            for(let i=0; i<selectedList.length; i++)
                constructsApplie.push(mapNameToType[selectedList[i].value]);            
            group_list.push({name, constructsApplie});
            $('#add-group-input').val('');
            $('#add-group-select').val('');
            this.render();         
        });
        $('.groupDeleteButton').click((e)=>{
            console.log(e);
        });
    },
//Change: end
    setupAddPropertyButton: function () {
        'use strict';

        $('#add-property-button-area').html('<a href="#" id="add-property-button" class="property-add" data-type="text" data-pk="1"           data-name="name" data-title="Enter description" data-placeholder="ahhhh" title="Add a new property to this element">        <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span>        Add Property</a>');
        // $('#add-property-button-area').html('<button type="button" id="addPropertyButton">Add Property</button>');
        // $('#cell-buttons').html('<button type="button" id="addPropertyButton">Add Property</button>');
        $('#add-property-button').click(function (e) {
            var newPropertyName = window.prompt('Name of the new custom property:', 'newProperty');
            if (newPropertyName) {
                var isValidName = false;
                var validityMessage = '';
                if (isNaN(newPropertyName)) {
                    var existsPropertyWithSameNameInThisElement = ui.getSelectedCells()[0].prop('customProperties/' + newPropertyName);
                    if (existsPropertyWithSameNameInThisElement === undefined) {
                        newPropertyName = newPropertyName.replace(/\W/g, '');
                        isValidName = true;
                    }
                    else {
                        validityMessage = 'A property with this same name has already been defined; please try again with a different name';
                    }
                }
                else {
                    validityMessage = 'Sorry, the name of a property cannot be a number; please try again with a different name';
                }

                if (isValidName) {
                    ui.getSelectedCells()[0].prop('customProperties/' + newPropertyName, '');
                }
                else {
                    ui.alert(validityMessage, 'Invalid property name');
                }
            }
            ui.collectActionData('click', e.currentTarget.id);
        });
    },
    clearOptionsPanel: function () {
        'use strict';

        $('#cell-actions').html('');
    },
    setupCollapseExpandButton: function () {
        'use strict';

        $('#cell-actions').append(
            '<a id="collapse-expand-actor-button" class="btn btn-default btn-xs button-horizontal" title="Shortcut: alt+click the actor">Collapse/Expand</a><br>'
        );
        $('#collapse-expand-actor-button').click(function (e) {
            if (ui.getSelectedCells()) {
                ui.hideSelection();//remove the focus from the actor
                ui.getSelectedCells()[0].toggleCollapse();
                ui.showSelection();//give the focus back to actor, now collapsed or expanded
            }

            ui.collectActionData('click', e.currentTarget.id);
        });
    },
    setupChangeDirectionButton: function () {
        'use strict';

        if (ui.getSelectedCells()[0].remove) {
            $('#cell-actions').append(
                '<a id="flip-direction-button" class="btn btn-default btn-xs button-horizontal" title="Change the direction of the dependency">Flip direction</a><br>'
            );
            $('#flip-direction-button').click(function (e) {
                var dependum = ui.getSelectedCells()[0];
                if (dependum) {
                    var connectedLinks = istar.graph.getConnectedLinks(dependum);

                    //first verify whether the flipped dependency would be valid
                    var source = connectedLinks[0].getSourceElement();
                    var target = connectedLinks[1].getTargetElement();
                    if (source === dependum) {
                        source = connectedLinks[1].getSourceElement();
                        target = connectedLinks[0].getTargetElement();
                    }
                    var isValid = istar.metamodel.dependencyLinks['DependencyLink'].isValid(target, source);//check with flipped source/target
                    // isValid = istar.types['DependencyLink'].isValid(target, source);//check with flipped source/target

                    if (isValid.isValid) {
                        //If we change the source and target without removing the vertices, the math for creating
                        //the curves may throw exceptions. Thus, we store them in a temp variable, and then re-add
                        //them reversed.
                        //It is reversed because the direction has changed, thus the first vertex is now the last vertex,
                        //and so on.
                        var originalVertices = connectedLinks[0].vertices();
                        var originalSource = connectedLinks[0].prop('source/id');
                        connectedLinks[0].vertices([]);
                        connectedLinks[0].prop('source/id', connectedLinks[0].prop('target/id'));
                        connectedLinks[0].prop('target/id', originalSource);
                        if (istar.graph.getCell(originalSource).isKindOfActor()) {
                            connectedLinks[0].prop('target/selector', 'actorSymbol');
                        } else {
                            connectedLinks[0].prop('target/selector', 'text');
                        }
                        if (istar.graph.getCell(connectedLinks[0].prop('source/id')).isKindOfActor()) {
                            connectedLinks[0].prop('source/selector', 'actorSymbol');
                        } else {
                            connectedLinks[0].prop('source/selector', 'text');
                        }
                        connectedLinks[0].vertices(_.reverse(originalVertices));


                        originalVertices = connectedLinks[1].vertices();
                        connectedLinks[1].vertices([]);
                        originalSource = connectedLinks[1].prop('source/id');
                        connectedLinks[1].prop('source/id', connectedLinks[1].prop('target/id'));
                        connectedLinks[1].prop('target/id', originalSource);
                        if (istar.graph.getCell(originalSource).isKindOfActor()) {
                            connectedLinks[1].prop('target/selector', 'actorSymbol');
                        } else {
                            connectedLinks[1].prop('target/selector', 'text');
                        }
                        if (istar.graph.getCell(connectedLinks[1].prop('source/id')).isKindOfActor()) {
                            connectedLinks[1].prop('source/selector', 'actorSymbol');
                        } else {
                            connectedLinks[1].prop('source/selector', 'text');
                        }
                        connectedLinks[1].vertices(_.reverse(originalVertices));
                        ui.selectCell(dependum);
                    }
                    else {
                        ui.displayInvalidLinkMessage(isValid.message + '. Thus, this Dependency currently cannot be flipped');
                    }
                }
                ui.collectActionData('click', e.currentTarget.id);
            });
        }
    },
    setupClearVerticesButton: function () {
        'use strict';

        $('#cell-actions').append(
            '<a id="clear-vertices-button" class="btn btn-default btn-xs button-horizontal" ' +
            'title="This deletes all vertices in this link. To delete an individual vertex, double click the vertex.">Clear vertices</a><br>'
        );
        $('#clear-vertices-button').click(function (e) {
            if (ui.getSelectedCells()) {
                ui.getSelectedCells()[0].vertices([]);
            }
            ui.collectActionData('click', e.currentTarget.id);
        });
    },
    setupDeleteButton: function () {
        'use strict';

        if (ui.getSelectedCells()[0].remove) {
            $('#cell-actions').append(
                '<a id="delete-element-button" class="btn btn-default btn-xs button-horizontal" title="Shortcut: Delete key">Delete</a><br>'
            );
            $('#delete-element-button').click(function (e) {
                if (ui.getSelectedCells()) {
                    ui.getSelectedCells()[0].remove();
                    ui.selectPaper();
                }
                ui.collectActionData('click', e.currentTarget.id);
            });
        }
    },
    setupOptionsPanel: function () {
        'use strict';

        if (this.model.prop('backgroundColor')) {
            $('#single-element-color-picker').get(0).jscolor.fromString(this.model.prop('backgroundColor'));
        }
        else if (ui.getSelectedCells()){
            $('#single-element-color-picker').get(0).jscolor.fromString(ui.defaultElementBackgroundColor);
        }
    },
    renderCustomProperty: function (propertyName) {
        'use strict';

        this.$table.find('tbody').append(this.template({
            propertyName: propertyName,
            propertyValue: this.model.prop('customProperties/' + propertyName),
            dataType: 'textarea'
        }));
    },
    setupCustomPropertyEditing: function (propertyName) {
        'use strict';

        $('#current' + propertyName).editable({
                showbuttons: 'bottom',
                success: function (response, newValue) {
                    //update backbone model
                    var updatedElement = ui.changeCustomPropertyValue(ui.getSelectedCells()[0], $(this).attr('data-name'), newValue);
                    return {newValue: updatedElement.prop('customProperties/' + propertyName)};
                }
            }
        )
            .on('shown', function () {
                ui.states.editor.transitionTo(ui.states.editor.EDITING_TEXT);
            })
            .on('hidden', function () {
                ui.states.editor.transitionTo(ui.states.editor.VIEWING);
            });
    },
});
