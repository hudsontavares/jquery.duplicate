/**
 * A plugin that allows you define reproducable fields
 * following it's patterns.
*/
(
    function($)
    {
        $.fn.duplicate = function(params)
        {
            /* The basic settings of our duplicable content; they can all be defined when we call duplicate() */
            var settings = $.extend
            (
                true,
                { 
                    /* The original and copy related attributes */
                    duplicable          : {nodeName: null, originalClass: 'clonable', copyClass: 'registry'},
                    registry            :
                    {
                        /* The data field for each DOM entry that stores the unique identifier of the related registry  */
                        idField     : 'data-id',
                        /* The data field for each DOM entry that stores the class name of the related registry  */
                        modelName   : 'data-class-name',
                        /* The URL you wanna call to control exclusion on server-side; must return a JSON in the format {status: true|false if it can't exclude the data, message: 'whatever message you wanna give to the user'} */
                        actionUrl   : null,
                        /* The confirmation message for each registry removed */
                        confirmMessage : 'Are you sure you want to delete this record? This action can\'t be undone.',
                        /* If required, you can specify the maximum number of entries allowedd */
                        maxItems    : {total: 0, message: 'The max items allowed limit has been reached.'},
                        
                    },
                    /* The add button that will be automatically appended to the DOM tree, adjacent to the duplicable container */
                    addButton           :
                    {
                        text        : 'Add',
                        className   : 'button duplicate add',
                        onCreate    : function(element){return element;}
                    },
                    /* The remove button that will be automatically appended to the DOM tree, adjacent to the duplicable container */
                    removeButton        :
                    {
                        text            : 'Remove',
                        className       : 'button duplicate remove',
                        onRemoveStart   : function(element){return true;},
                        onRemoveEnd     : function(id, message, element){return true;}
                    }
                },
                params
            );
            
            /* We always consider the first child of our  */
            settings.duplicable.nodeName = $(':first-child', this);
            if (settings.duplicable.nodeName.length == 0)return this;
            settings.duplicable.nodeName = settings.duplicable.nodeName[0].tagName.toLowerCase();
            
            /*
                The event is binded on the holder itself and uses bubbling to keep the memory footprint
                low, even with huge lists of duplicated items
            */
            $(this).bind
            (
                'click',
                function(e)
                {
                    var target = $(e.target);
                    
                    if(target.hasClass(settings.removeButton.className))
                    {                        
                        var parent = target.parents(settings.duplicable.nodeName + '.' + settings.duplicable.copyClass);
                        
                        if(parent.attr('data-idItem') == 0 || settings.registry.actionUrl == null)
                            parent.slideUp('fast', function(){this.parentNode.removeChild(this);return true;});
                        else
                        {
                            if(window.confirm(settings.registry.confirmMessage))
                            {
                                $.post
                                (
                                    settings.registry.actionUrl,
                                    {id: parent.attr(settings.registry.idField), modelName: parent.attr(settings.registry.modelName)},
                                    function(data)
                                    {
                                        if (data != '')data = eval('(' + data + ')');
                                        if('message' in data)alert(data.message);
                                        
                                        if('status' in data && data.status)
                                            parent.slideUp('fast', function(){this.parentNode.removeChild(this);return true;});
                                    }
                                );
                            }
                        }
                    }
                    
                    return true;
                }
            );
            
            /* Returns the current object for chaining purposes */
            return this.each
            (
                function(index)
                {
                    var source  = $(this).find(settings.duplicable.nodeName + '.' + settings.duplicable.originalClass).removeClass(settings.duplicable.originalClass).addClass(settings.duplicable.copyClass), target = $(this),
                    add     = $
                    (
                        [
                            '<button type="button" class="',
                            settings.addButton.className,
                            '">',
                            settings.addButton.text,
                            '</button>'
                        ].join('')
                    );

                    /* The basic HTML is a copy of our duplicable element; we copy it and remove! */
                    this.basicHtml = source[0].outerHTML;
                    source.remove();
                    
                    /* The add button must enter the tree */
                    $(this).after(add);
                    
                    /*
                        The add item button behavior; as it is located outside the duplicable tree,
                        we must listen to it here
                    */
                    add.bind
                    (
                        'click',
                        function(e)
                        {
                            var count     = target.find(settings.duplicable.nodeName + '.' + settings.duplicable.copyClass).length;
                            var basicHtml = target[0].basicHtml;
                            
                            if(settings.registry.maxItems.total != 0 && settings.registry.maxItems.total <= count)
                            {
                                if (settings.registry.maxItems.message != null)
                                    alert(settings.registry.maxItems.message);
                                
                                return false;
                            }
                            
                            if (basicHtml == null)basicHtml = '';
                            
                            /* We must create the delete button on the new record and add it to the tree */
                            var newRecord = $(basicHtml.replace(/\{current_index\}/gmi, count + 1));
                            newRecord.append
                            (
                                [
                                    '<button type="button" class="',
                                    settings.removeButton.className,
                                    '">',
                                    settings.removeButton.text,
                                    '</button>'
                                ].join('')
                            );
                            target.append(newRecord);
                            return true;
                        }
                    );
                    
                    return true;
                }
            );
        }
    }
)(jQuery);