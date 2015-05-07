/* @hudson_ */

(
    function($)
    {
        $.fn.duplicate = function(params)
        {
            var settings = $.extend
            (
                true,
                {
                    duplicableClass     : 'clonable',
                    registryIdField     : 'data-id',
                    registryClassName   : 'data-class-name',
                    maxItems            : 0,
                    addButton           :
                    {
                        text        : 'Adicionar',
                        className   : 'button duplicate add',
                        onCreate    : function(element){return element;}
                    },
                    removeButton        :
                    {
                        text            : 'Remover',
                        className       : 'button duplicate remove',
                        onRemoveStart   : function(element){return true;},
                        onRemoveEnd     : function(id, message, element){return true;}
                    }
                },
                params
            );
            
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
            
            return this.each
            (
                function(index)
                {
                    var source     = $(this).find('li.' + settings.duplicableClass).removeClass('clonable').addClass('registry'), target = $(this);
                    this.basicHtml = source[0].outerHTML;
                    source.remove();
                    
                    /* Botão "adicionar item" */
                    $(this).after
                    (
                        [
                            '<button type="button" class="',
                            settings.addButton.className,
                            '">',
                            settings.addButton.text,
                            '</button>'
                        ].join('')
                    );
                    
                    $('button.' + settings.addButton.className.split(' ').join('.'), this.parentNode).bind
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