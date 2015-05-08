/**
 * A plugin that allows you define reproducable fields
 * following a pattern that you define once.
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
                    duplicable          : {nodeName: null, html: '', originalClass: 'clonable', copyClass: 'registry'},
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
                        className   : 'button duplicate add'
                    },
                    /* The remove button that will be automatically appended to the DOM tree, adjacent to the duplicable container */
                    removeButton        :
                    {
                        text            : 'Remove',
                        className       : 'button duplicate remove'
                    }
                },
                params
            );
            
            /* We always consider the first child as the duplicable tag, to not make the programmer repeat himself  */
            settings.duplicable.nodeName = $(':first-child', this);
            if (settings.duplicable.nodeName.length == 0)return this;
            settings.duplicable.nodeName = settings.duplicable.nodeName[0].tagName.toLowerCase();
            
            /* Event listeners: to allow control from outside the plugin */
            /* Add new registry */
            $(this).bind
            (
                'duplicate.add',
                function(event, params, config)
                {
                    if (config == null)config = settings;
                    
                    /* The counter of current entries and the new record holder */
                    var  target    = $(this),
                         count     = target.find(config.duplicable.nodeName + '.' + config.duplicable.copyClass).length,
                         newRecord = $(config.duplicable.html.replace(/\{current_index\}/gmi, count + 1));
                    
                    
                    /* We must respect if there's a maxItems variable defined */
                    if(config.registry.maxItems.total != 0 && config.registry.maxItems.total <= count)
                    {
                        if (config.registry.maxItems.message != null)
                            alert(config.registry.maxItems.message);
                        
                        return false;
                    }
                    
                    /* Appending the remove button */
                    newRecord.append
                    (
                        [
                        '<button type="button" class="', config.removeButton.className, '">',
                            config.removeButton.text,
                        '</button>'
                        ].join('')
                    );

                    target.append(newRecord);
                    return true;
                }
            )
            /* Remove a registry */
            .bind
            (
                'duplicate.remove',
                function(event, registry, config)
                {
                    if (config == null)config = settings;
                    
                    /* When dealing with local-only entries, things are really easier */
                    if (registry.attr('data-idItem') == 0 || config.registry.actionUrl == null)
                    {
                        registry.slideUp('fast', function(){this.parentNode.removeChild(this);return true;});
                        return true;
                    }
                    
                    /* When you have a remote ID and an action URL defined,  things need to be checked first */
                    if(window.confirm(config.registry.confirmMessage))
                    {
                        $.post
                        (
                            config.registry.actionUrl,
                            {id: registry.attr(config.registry.idField), modelName: registry.attr(config.registry.modelName)},
                            function(data)
                            {
                                if (data != '')data = eval('(' + data + ')');
                                if('message' in data)alert(data.message);
                                
                                if('status' in data && data.status)
                                    parent.slideUp('fast', function(){this.parentNode.removeChild(this);return true;});
                                    
                                return true;
                            }
                        );
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
                        '<button type="button" class="', settings.addButton.className, '">',
                            settings.addButton.text,
                        '</button>'
                        ].join('')
                    );

                    /* The basic HTML is a copy of our duplicable element; we copy it and remove! */
                    settings.duplicable.html = source[0].outerHTML;
                    source.remove();
            
                    /* The event capture inside each duplicable tree */
                    $(this).bind
                    (
                        'click',
                        function(e)
                        {
                            var target = $(e.target);
                            
                            if(target.hasClass(settings.removeButton.className))
                            {                        
                                var parent = target.parents(settings.duplicable.nodeName + '.' + settings.duplicable.copyClass);
                                $(this).trigger('duplicate.remove', [parent, settings]);
                            }
                            
                            return true;
                        }
                    );
                    
                    /* The add item button behavior */
                    add.bind
                    (
                        'click',
                        function(e)
                        {
                            target.trigger('duplicate.add', [{}, settings]);
                            return true;
                        }
                    ).insertBefore(this);
                    
                    return true;
                }
            );
        }
    }
)(jQuery);