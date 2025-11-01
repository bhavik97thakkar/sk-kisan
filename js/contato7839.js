function validaEmail(email){
	var re=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; return re.test(email);}
function TestaCPF(strCPF) { var Soma; var Resto; Soma = 0; if (strCPF == "00000000000") return false; for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i); Resto = (Soma * 10) % 11; if ((Resto == 10) || (Resto == 11)) Resto = 0; if (Resto != parseInt(strCPF.substring(9, 10)) ) return false; Soma = 0; for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i); Resto = (Soma * 10) % 11; if ((Resto == 10) || (Resto == 11)) Resto = 0; if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false; return true; }

$(function(){	
    $('select[name="contato_assunto"]').carregarAssuntos();
    $('select[name="contato_assunto"] option').eq(0).remove();
    $('select[name="contato_assunto"]').prepend('<option selected disabled>Assunto</option>');

    var cliKey=shopping_token;
    var hash="";  
    getCaptcha = function (){
        if ($('#captcha').html()==''){
            $('#captcha').html(		
                '<div class="row">'+
                    '<div class="col-lg-6">'+
                        '<div class="form-input-item">'+
                            '<input type="text" name="txtCaptcha" class="medium-input" id="txtCaptcha" placeholder="Digite os caracteres">'+
                        '</div>'+		
                    '</div>'+
                    '<div class="col-lg-6 pl-lg-0">'+
                        '<div class="form-input-item">'+
                            '<a href="javascript:getCaptcha();" >'+
                            '	<div id="imagemCaptchaVerify"></div>'+
                            '</a>'+						
                        '</div>'+
                    '</div>'+
                '</div>'
            );
        }
        $('#imagemCaptchaVerify').html('<br /><p style="color:#000;">Carregando...</p>');
        $.ajax('https://sal.madnezz.com.br/api/?do=captcha&tk=' + shopping_token,{type:'POST',data:{0:0},dataType:'json'
        }).then(function (data){
            $('#imagemCaptchaVerify').html('<img src=\"'+data.status+'\" id=\"imgCaptcha\"  style="width:100%;height:49px;" />');
            hash=data.hash;
        });
    }

    function alerta(txt) {
        $('.contato_alerta').html(txt).fadeOut(400, function () { $(this).fadeIn(400); });
    }

    $.mask.definitions["t"]="[0-9-]";
        $('[name="contato_telefone"]').mask(" 99  tttttttt?ttt",{
        placeholder:"_"
    }); 

    //FORM DETALHADO
    detalhado=false;
    assunto_detalhado="Evento Adverso";

    $("input[pergunta_radio]").change(function(){               
        $("[name="+$(this).attr('pergunta_radio')+"]").val($(this).val());
    });

    $("body").on('change','[name=contato_assunto]',function(){ //CONTROLE 
        if($(this).val()==assunto_detalhado){
            detalhado=true;
            $('.detalhado').fadeIn("fast");
            $("[name=contato_mensagem]").attr('placeholder',"Algo mais que queira contar?");
        }else{
            detalhado=false;
            $('.detalhado').fadeOut("fast");
            $("[name=contato_mensagem]").attr('placeholder',"Mensagem");
        }
    });


    $('#form_contato').on('submit',function(){
        resposta_fatante=false;
        mensagem_detalhado="";
        if(detalhado){ //MONTA MENSAGEM DETALHADA
            $(".detalhado input[pergunta]").each(function(){
                mensagem_detalhado+=$(this).attr('placeholder')+": "+($(this).val()?$(this).val():"Não informado")+"\n\n";
            });
            $('input[pergunta]').each(function(){
                if(!$(this).val()){
                    resposta_fatante=true;
                }
            });
        }
        //console.log(mensagem_detalhado);
        if(	!$("#txtCaptcha").val()||!$("[name=contato_nome]").val()||!$("[name=contato_telefone]").val()||!$("[name=contato_email]").val()||!$("[name=contato_assunto]").val()||!$("[name=contato_mensagem]").val()&&!detalhado){
            alerta('Preencha todos os campos');
            return false;
        }else if (!validaEmail($("[name=contato_email]").val())){
            alerta('Preencha um e-mail válido');
            return false;
        }else if (resposta_fatante){ //CAMPOS DETALHADOS
            alerta('Preencha todos os campos');
            return false;
        }else{
            $(".form_submit").prop("disabled",true);
            $.ajax('https://sal.madnezz.com.br/api/?do=contato&tk=' + cliKey + '&captcha=' + $("#txtCaptcha").val() + '&hash=' + hash,{
                data:{
                    "nome":$("[name=contato_nome]").val(),
                    "email":$("[name=contato_email]").val(),
                    "telefone":$("[name=contato_telefone]").val(),
                    "assunto":$("[name=contato_assunto]").val(),
                    "mensagem":(detalhado?mensagem_detalhado+" \n\nAlgo mais que queira contar?\n":"")+$("[name=contato_mensagem]").val(),
                    "sendmail":1
                },
                type:'POST',
                dataType:'json'
            }).then(function (data){
                switch (data.status){
                    case "done":
                        alerta('Mensagem enviada com sucesso!');
                        $("#form_contato input[type=text],#form_contato input[type=email], #form_contato select, textarea").val("");
                        break;
                    case "captcha-wrong-code":
                        alerta('O código do Captcha é inválido, digite novamente');
                        getCaptcha();
                        break;
                    case "captcha-expired":
                        alerta('O código do Captcha já foi utilizado, digite novamente');
                        getCaptcha();
                        break;
                }
                $(".form_submit").prop("disabled",false);
            });
            return false;
        }
        return false;
    });
    getCaptcha();

    //FECHA ALERTA
    $('.form-message').on('click','button',function(){
        $(this).parents('.form-message').hide();
    });
});