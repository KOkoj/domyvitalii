$(function() {
	
	function fmt_amount(a) {
		a*=1000000;
		if (a > 1000000000) a = Math.round(a/100000000)/10 + ' bio';		
		else if (a > 1000000) a = Math.round(a/100000)/10 + ' mio';
		else if (a > 1000) a = Math.round(a/100)/10 + ' k';
		else a = Math.round(a*10)/10;
		return '€ '+a;
	};
	
	function fmt_percent(a) {
		return Math.round(a*10)/10 + '%';
	}
	
	var indicators = {
		'gdp_ppp': ['GDP in PPP', fmt_amount],
		'empl': ['Employment', fmt_percent],
		'youth_unempl': ['Youth Unemployment', fmt_percent],
		'lt_unempl': ['Long-term unemployment', fmt_percent],
		'ren_energy': ['Renewable Energy Share', fmt_percent]
	},
	
	colorscales = [
		'Oranges','Reds','Blues','Greens','Purples','Greys',
		'OrRd','PuBu','BuPu','BuGn','YlOrBr','GnBu','PuRd','PuBuGn'];
	
	$.each(indicators, function(k,v) {
		$('#indicator').append('<option value="'+k+'">'+v[0]+'</option>');
	});
	
	$.each(colorscales, function(i,v) {
		$('#colors').append('<option>'+v+'</option>');
	});
	
	
	$.ajax({
		url: 'data.json',		
		success: function(data) {
			
			var map, colsc, tt, i, values, prop, prop_fmt;

			// make sure the map fits inside browser window
			$('#map').height(Math.max(500, $(window).height()-60));
			
			/*
			 * updates the map after changing display properties
			 */
			function updateMap() {			
				prop = $('#indicator').val();	
				prop_fmt = indicators[prop][1]
			
				map.clear(); // remove everything from the map
				
				// first map layer for colored fills
				map.addLayer({
					id: 'regions',
					key: 'nuts2'
				});
				
				// populate tooltip contents
				tt = {};
				$.each(data, function(i,d) {
					d[prop] = Number(d[prop]);
					tt[d.nuts] = [d.nuts, indicators[prop][0]+': '+prop_fmt(d[prop])];
				});
				
				// initialise color scale
				colsc = new chroma.ColorScale({
					colors: chroma.brewer[$('#colors').val()],
					limits: chroma.limits(data, $('#scaletype').val(), 9, prop)
				});
	
				// update legend
				var i,v,c,r,leg = $('#legend');
				leg.html('');					
				if ($('#scaletype').val() != 'c') {
					for (i=0;i<colsc.classLimits.length-1;i++) {
						v=colsc.classLimits[i]+(colsc.classLimits[i+1]-colsc.classLimits[i])*.5;
						c = colsc.getColor(v);
						r = $('<div class="row" />');
						r.append('<div class="col" style="background:'+c+'" />');
						r.append('<label>'+prop_fmt(colsc.classLimits[i])+' &nbsp;–&nbsp; '+prop_fmt(colsc.classLimits[i+1])+'</label>');
						leg.append(r);
					}
				} else {
					
					for (i=0;i<100;i++) {
						v = colsc.min + (i/99)* (colsc.max-colsc.min);
						c = colsc.getColor(v);
						r = $('<div style="width:40px;height:3px;background:'+c+'" />');
						leg.append(r);
					}
					leg.append('<label style="position: absolute; left: 50px; top: 0px">'+prop_fmt(colsc.min)+'</label>');
					leg.append('<label style="position: absolute; left: 50px; bottom: 0px">'+prop_fmt(colsc.max)+'</label>');					
				}
				
				// color map polygons
				map.choropleth({
					data: data,
					key: 'nuts',
					colors: function(d) {
						if (d == null) return '#ccc';
						return colsc.getColor(d[prop]);
					}
				});
				
				// add another map layer on top for showing black outline on mouse hover
				map.addLayer({
					id: 'regions',
					className: 'outline',
					key: 'nuts2'
				});
				
				// and apply tooltips to this layer
				map.tooltips({
					content: tt
				});
			}
						
			$('.config').click(updateMap);
			$('.config').change(updateMap);
					
			map = $K.map('#map');
			map.loadMap('italy.svg', function(map) {
				updateMap();	
			});
		}
	});
});
