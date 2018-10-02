(function($){
	"use strict";
	
	var validate_state = true;
	
	$.fn.validate = function(options){
		//Default Settings
		var settings = {
			dir		 				: 'down',
			fieldContainer 			: $(this),
			tableName	 			: '',
			methodName 				: '',
			checkDuplicateRecUrl 	: '',
			validationState	 		: false,
			submitType	 			: 'submit',
			callback				: function() {},
			validaterules: function(rule_type, element){
				var rules = {		
					alphanum : {
					   check: function(element) {					   
							if(element.val())
								return settings.testPattern(element.val(), /^[a-zA-Z0-9\s\r\n@#%$&,"'?<=>!+()*:&;//\\._-]+$/i);
							return true;
					   },
					   msg : "must be letters and numbers"
					},
					alpha : {
					   check: function(element) {					   
							if(element.val())
								return settings.testPattern(element.val(), /^[a-zA-Z ._-]+$/i);
							return true;
					   },
					   msg : "should only contain letters"
					},
					digit : {
					   check: function(element) {					   
							if(element.val())
								return settings.testPattern(element.val(), /^[-+]?[0-9]+$/);
							return true;
					   },
					   msg : "should only contain integer"
					},
					number : {
					   check: function(element) {					   
							if(element.val())
								return settings.testPattern(element.val(), /^[-+]?[0-9.]+$/);
							return true;
					   },
					   msg : "should only contain numbers"
					},
					date : {
					   check: function(element) {					   
							if(element.val())
								return settings.testPattern(element.val(), /^[0-9-]*$/);
							return true;
					   },
					   msg : "must be a valid date"
					},
					time : {
					   check: function(element) {					   
							if(element.val())
								return settings.testPattern(element.val(), /^[0-9:APM]*$/);
							return true;
					   },
					   msg : "must be a valid time"
					},				
					url : {
					   check : function(element) {
							if(element.val())							
								return settings.testPattern(element.val(), /(http(s)?:\\)?([\w-]+\.)+[\w-]+[.com|.in|.org]+(\[\?%&=]*)?/);												
							return true;
					   },	
					   msg : "must be a valid url"
					},
					email : {
					   check: function(element) {					   
							if(element.val())
								return settings.testPattern(element.val(), /^[a-z0-9._%-^,\s]+@[a-z0-9-.^,\s]+\.[a-z^,\s]{2,4}$/i);
							return true;
					   },
					   msg : "must be a valid email address"
					},
					phone : {
					   check : function(element) {
							if(element.val())
								return settings.testPattern(element.val(), /^[+0-9-^,\s]+$/);
							return true;
					   },
					   msg : "must be a valid phone number"
					},
					field_name : {
					   check : function(element) {
							if(element.val())				   				
								return settings.testPattern(element.val(), /^[a-z_.0-9]*$/);                   
							return true;
					   },
					   msg : "should be in lowercase without space"
					},
					min_length : {
					   check : function(element) {
							if(element.val()){
								if(element.val().length < element.attr('minlength'))						
									return false;
								else
									return true;
							}
							return true;
					   },
					   msg : "min_length"
					},           
					check_duplicate : {
					   check : function(element) {
							if(element.val()){
								var state = false;					
								
								if(element.attr('table') !== undefined)
									var table = element.attr('table');
								else
									var table = settings.tableName;
							
								var condition = "";						
								var condition_field = "";
								
								if(element.attr('condition') !== undefined)
								{
									var condition_element_field = new Array();
									condition_element_field = element.attr('condition').split('=');
									
									if($('[name='+ condition_element_field[1] +']').length > 0)
										condition = $('[name='+ condition_element_field[1] +']').val();
									else
										condition = $('#'+ condition_element_field[1]).val();
									
									condition_field = condition_element_field[0];
								}						
								                                    
								$.ajax({
									async: false,
									type: "POST",
									url: settings.checkDuplicateRecUrl,						
									data: 'table='+ table +'&field=' + element.attr('name') + '&data=' + element.val() + '&id=' + $('[name=id]').val() + '&method=' + settings.methodName + '&condition_field=' + condition_field + '&condition_value=' + condition + '&csrfToken=' + $('[name=csrfToken]').val(),
									success: function(msg){
										if(msg==0)
											state = true;
										else
											state = false;
									}							
								});
								
								return state;
							}
							return true;
					   },
					   msg : "check_duplicate"
					},   
					match : {
					   check : function(element) {
							if(element.val()){
								if(element.val()==$(element.attr('match')).val())
									return true;
								else
									return false;
							}
							return true;
					   },
					   msg : "not matched"
					},   
					mime_type : {
					   check : function(element) {
							if(element.attr('file-name')){
								// get file extension
								var extension = element.attr('file-name').substr(element.attr('file-name').lastIndexOf('.') + 1).toLowerCase();
								
								// show error
								if(element.attr('data-mime-type') !== undefined && element.attr('data-mime-type').indexOf(extension) === -1)
									return false;
								else 
									return true;
							}
							return true;
					   },
					   msg : "not supported"
					},
					file_size : {
					   check : function(element) {
							if(element.attr('file-size')){
								// show error
								if(Number(element.attr('file-size')) > (1024 * 1024) * 5)
									return false;
								else 
									return true;
							}
							return true;
					   },
					   msg : "file size exceeded"
					},					
					required : {                
						check: function(element) {						
							if(element.is('input:checkbox') || element.is('input:radio'))
							{
								var selector = $('[name="' + element.attr('name') +'"]:checked');                             
								
								if(selector.length > 0) 
									return true;
								else
									return false;
							}
							else
							{
								if(element.val().length > 0 || (element.attr('type')=='file' && !empty(element.attr('data-file-name'))))
									return true;
								else
									return false;	
							}				   				   
					   },
					   msg : "is required"
					}
				}
				
				var valid = new Array();
							
				//return validation state
				valid[0] = rules[rule_type].check(element);
				
				//return validaton text
				valid[1] = rules[rule_type].msg;
							
				return valid;
			},
			testPattern: function(value, pattern){		
				var regExp = pattern		
				return regExp.test(value);
			},
			validationList: function(elem){				
				var validationList = elem.attr('validation').split(/\s+/);
				var validations = new Array(validationList.length);
							
				$.each(validationList, function(index, item){
					validations[index] = item;
				});

				return validations;
			},
			checkField: function(event, field){	
				//field title
				if(field.attr('placeholder') !== undefined && field.attr('placeholder') != '')
					var field_title = field.attr('placeholder');
				else
					var field_title = 'This field';
								
				//get validation rules as array
				validations = settings.validationList(field);			
				
				//loop thru validation array	
				for(var i=0;i<=validations.length - 1;i++)
				{				
					if(!(event=='keyup' && validations[i]=='check_duplicate'))
					{
						//get validation 
						result = settings.validaterules(validations[i], field);
							
						//console.log(result);
							
						//set validate message
						message = result[1];
												
						if(result[0])
						{					
							//remove validation error
							settings.RemoveError(field);
						}
						else
						{							
							//show validation error
							if(message=='min_length')
								settings.ShowError(field, field_title +" should contain min "+ field.attr('minlength') +" characters");						
							else if(message=='check_duplicate')
								settings.ShowError(field, field_title +" '"+ field.val() +"' already exists");											
							else
							{
								if(field.is('input:checkbox'))
									settings.ShowError(field, 'Please choose at least one option');
								else if(field.is('input:radio'))
									settings.ShowError(field, 'Please choose one option');
								else if(field.is('select'))
									settings.ShowError(field, 'Please select a value from list');
								else if(field.is('input:file'))
								{
									if(message=='not supported')
										settings.ShowError(field, 'Please select a valid file type ('+ field.attr('data-mime-type') +')');
									else
										settings.ShowError(field, 'File size exceeded. Please select a file upto 5MB');
								}
								else
									settings.ShowError(field, field_title +' '+ message);
							}
							
							//assign validate state
							validate_state = false;					
														
							//exit from loop
							break;
						}		
					}
				}
				
				return validate_state;			
			},
			validate_fields: function(event, field){
				//default validation state
				validate_state = true;
				
				if(event=='submit' || event=='ajax')
				{
					//loop thru form ele
					settings.fieldContainer.find('*[validation]:not(:disabled):not([validation=""]):not([validate=false])').each(function(){					
						//set state
						submit_state = settings.checkField(event, $(this));			
						
                        //console.log($(this).attr('name') + " " + $(this).attr('validation'))  + " " + submit_state;
						
						// return status
						return submit_state;
					});
									
					//scroll to the first error field
					if(!submit_state)
					{
						$('html, body').animate({
							scrollTop: settings.fieldContainer.find('*[validation].field-error').first().offset().top - 95				
						}, 500, function(){				
							//set the cursor to the first error field of the form
							settings.fieldContainer.find('*[validation].field-error').first().focus();						
						});
					}
					
					settings.callback(submit_state);	
				}
				else				
					submit_state = settings.checkField(event, field);
							
				return submit_state;			
			},
			ShowError: function(field, msg){
				//add validation error class
				field.addClass('field-error');	
				
				//remove error message
				field.closest("div[class^='col-sm-']").find('ul.parsley-errors-list').remove();			
				
				//add error message
				field.closest("div[class^='col-sm-']").append('<ul class="parsley-errors-list filled"><li class="parsley-required">'+ msg +'</li></ul>');			
			},
			RemoveError: function(field){
				//remove validation error class							
				field.removeClass('field-error');	
								
				//remove error message
				field.closest("div[class^='col-sm-']").find('ul.parsley-errors-list').remove();		
			},
			addValidation: function(field, $validation){
				//add validation rules							
				field.attr('validation', $validation);				
			},
			removeValidation: function(field){
				//remove validation from field
				field.removeAttr('validation');
			}		
		}
				
		//If option is passed throuth arg then option will ne overwrite defaults settings else default settings is taken
		if(options) {$.extend(settings, options);}
		
		var ofstLeft = 0;
		var ofstTop = 0;
		var field, validations, result, validate_state = true, submit_state = true, message = '';
		var container, field_title;
		var validation_state;
				
		//form submit
		settings.fieldContainer.submit(function(e){	
			e.stopPropagation();
			
			// if form disabled
			var disabled = $(this).attr('disabled');
			
			// check if form disable
			if (!(typeof disabled !== typeof undefined && disabled !== false)) {			
				//validate form elements
				if(settings.submitType=='submit')				
					return settings.validate_fields('submit', false);
				else if(settings.submitType=='ajax')
				{
					e.preventDefault();
					settings.validate_fields('ajax', false);				
				}
			} else {				
				e.preventDefault();
			}
		});
			
		//form element keyup event for input and textarea
		//settings.fieldContainer.find('input[validation]:not(:disabled):not([validation=""]):not([validate=false]), textarea[validation]:not(:disabled):not([validation=""]):not([validate=false])').keyup(function(){
		$(document).on('keyup', 'input[validation]:not(:disabled):not([validation=""]):not([validate=false]), textarea[validation]:not(:disabled):not([validation=""]):not([validate=false])', function(e){
			if (!(e.which > 36 && e.which < 41)) {
				settings.validate_fields('keyup', $(this));		
			}
		});
		
		//form element change event for input and textarea
		//settings.fieldContainer.find('input[type=checkbox][validation]:not(:disabled):not([validation=""]):not([validate=false]), input[type=radio][validation]:not(:disabled):not([validation=""]):not([validate=false])').change(function(){
		$(document).on('change', 'input[validation]:not(:disabled):not([validation=""]):not([validate=false]), select[validation]:not(:disabled):not([validation=""]):not([validate=false])', function(e){
			if (!(e.which > 36 && e.which < 41)) {
				settings.validate_fields('change', $(this));		
			}
		});
		
		//form element keyup event for select
		//settings.fieldContainer.find('select[validation]').change(function(){
		/*$(document).on('change', 'select[validation]:not(:disabled):not([validation=""]):not([validate=false])', function(){		
			settings.validate_fields('change', $(this));
		});*/
				
		return settings;
	}
}(jQuery));