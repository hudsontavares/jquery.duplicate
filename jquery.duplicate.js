/**
 * A plugin that allows you define reproducable fields
 * following it's patterns.
*/
(
    function($)
    {
        $.fn.duplicate = function(params)
        {
            /* The basic settings of our duplicable content; they can all be defined on duplicate() call */
            var settings = $.extend
            (
                true,
                { 
                    /* The class that must be defined on the clonable element */
                    duplicableClass     : 'clonable',
                    /* The data field for each DOM entry that stores the unique identifier of the related registry  */
                    registryIdField     : 'data-id',
                    /* The data field for each DOM entry that stores the class name of the related registry  */
                    registryClassName   : 'data-class-name',
                    /* If required, you can specify the maximum number of entries allowedd */
                    maxItems            : 0,
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
            
            /*
                The event is binded on the holder itself and uses bubbling to keep the memory footprint
                low, even with huge lists of duplicate items
            */
            $(this).bind
            (
                'click',
                function(e)
                {
                    var target = $(e.target);
                    
                    if(target.is('button.delete'))
                    {                        
                        var parent = target.parents('li.registry');
                        
                        if(parent.attr('data-idItem') == 0)
                            parent.slideUp('fast', function(){this.parentNode.removeChild(this);return true;});
                        else
                        {
                            if(window.confirm(parent.attr('data-message') || 'Confirmar a exclusão do registro atual?'))
                            {
                                $.post
                                (
                                    'services/delete_item.php',
                                    {idItem: parent.attr('data-idItem'), className: parent.attr('data-className')},
                                    function(data)
                                    {
                                        data = eval('(' + data + ')');
                                        alert(data.message);
                                        
                                        if(data.status)
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
                    var source  = $(this).find('li.' + settings.duplicableClass).removeClass('clonable').addClass('registry'), target = $(this),
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
                            var count     = target.find('li.registry').length;
                            var basicHtml = target[0].basicHtml;
                            
                            if(settings.maxItems != 0 && settings.maxItems <= count)return false;
                            if (basicHtml == null)basicHtml = '';
                            
                            target.append(basicHtml.replace(/\{current_index\}/gmi, count + 1));
                            return true;
                        }
                    );
                    
                    return true;
                }
            );
        }
    }
)(jQuery);