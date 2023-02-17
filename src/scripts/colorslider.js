Ext.ns('Ext.ux.slider');

Ext.ux.slider.Highlight = Ext.extend(Object, {
    
    init: function(slider) {
        this.slider = slider;
        var that = this;
        
        // Overwrite moveThumb method to update element after animated slide
            slider.moveThumb = function(index, v, animate){
                var thumb = this.thumbs[index].el;

                if(!animate || this.animate === false){
                    thumb.setLeft(v);
                }else{
                    thumb.shift({left: v, stopFx: true, duration:.35, callback : that.syncElementSize, scope : that});
                }
            };
       
        slider.on({
            scope    : this,
            afterrender   : this.onAfterRender,
            drag     : this.syncElementSize,
            dragend  : this.syncElementSize,
            changecomplete : this.syncElementSize,
            destroy  : this.destroy
        });
    },
    
    onAfterRender : function(s) {
        this.el1 = s.innerEl.createChild({
            cls : 'ext-ux-slider-left'
        });
		this.el2 = s.innerEl.createChild({
            cls : 'ext-ux-slider-middle'
        });
		this.el3 = s.innerEl.createChild({
            cls : 'ext-ux-slider-right'
        });
        this.syncElementSize();
    },
    
    syncElementSize : function() {
        var s = this.slider;
        			
		var thumb1Right = s.thumbs[0].el.getRight(true),
                thumb2Right = s.thumbs[1].el.getRight(true),
                thumb1Left = s.thumbs[0].el.getLeft(true),
                thumb2Left = s.thumbs[1].el.getLeft(true),
                highlightLeft = Math.min(thumb1Right, thumb2Right);

			//this.el3.setLeft(s.getEl.getLeft(true));
			this.el1.setLeft(s.el.getLeft(true)-6);
			this.el1.setWidth(thumb1Left+7);				
            this.el2.setLeft(highlightLeft);
            this.el2.setWidth(Math.max(thumb1Left, thumb2Left) - highlightLeft);
			this.el3.setLeft(thumb2Right);
			this.el3.setWidth(s.el.getRight(true)-thumb2Right-8);
	},
    
    destroy : function() {
        this.slider.un({
            scope    : this,
            afterrender   : this.onRender,
            drag     : this.syncElementSize,
            dragend  : this.syncElementSize,
            changecomplete : this.syncElementSize,
            destroy  : this.destroy
        });
        this.el.destroy();
    }
});

