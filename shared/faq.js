(() => {
  const section = document.querySelector('[data-ala-faq]');
  if (!section) return;

  const root = new URL('../', document.currentScript.src);
  const helpUrl = new URL('channel/help-center/', root).href;

  const categories = [

    {
      title: 'Solicitud de préstamo',
      tab: [
        {
          label: '¿Cuándo llegará el préstamo a mi cuenta bancaria?',
          value: '<p>Una vez aprobada su solicitud, ALA procesará el desembolso de inmediato. Por lo general, los recursos se depositan en su cuenta bancaria en aproximadamente 3 minutos; en casos excepcionales, el depósito puede demorar más.<\/p>\n<p>Verifique que los datos de su cuenta bancaria sean correctos para evitar rechazos o errores en la transferencia. Si detectamos alguna inconsistencia, nos pondremos en contacto con usted para validarla.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/cuando-llegara-el-prestamo-a-mi-cuenta-bancaria/'
        },
        {
          label: '¿Por qué no se ha aprobado mi solicitud de un nuevo préstamo?\n',
          value: '<p>ALA evalúa periódicamente el historial crediticio y la información de cada cliente. La aprobación y el límite disponible dependen de su situación crediticia y del resultado de la evaluación del sistema, por lo que pueden variar con el tiempo.<\/p>\n<p>Le recomendamos realizar sus pagos puntualmente para mantener un buen historial crediticio.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/por-que-no-se-ha-aprobado-mi-solicitud-de-un-nuevo-prestamo/'
        },
        {
          label: '¿Cuánto tiempo tarda la aprobación del préstamo?',
          value: '<p>El tiempo de evaluación depende de que la información proporcionada sea correcta y completa. Si los datos no presentan inconsistencias, puede recibir una respuesta en tan solo 3 minutos. Si es necesario validar algún dato, el proceso podría demorar más y nos pondremos en contacto con usted.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/cuanto-tiempo-tarda-la-aprobacion-del-prestamo/'
        },
        {
          label: '¿Cuáles son los requisitos para solicitar un préstamo?\n',
          value: '<p>Para solicitar un préstamo en ALA debe cumplir con los siguientes requisitos:<br />• Tener entre 18 y 55 años.<br />• Ser de nacionalidad mexicana y contar con una identificación oficial INE/IFE vigente.<br />• Tener una cuenta bancaria mexicana vigente a su nombre para recibir el préstamo y realizar los pagos.<br />Nota: La aprobación y el desembolso del préstamo están sujetos al resultado de la evaluación del sistema.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/cuales-son-los-requisitos-para-solicitar-un-prestamo/'
        },
        {
          label: '¿Puedo solicitar varios préstamos?\n',
          value: '<p>Sí, puede solicitar más de un crédito. Sin embargo, la disponibilidad, el monto y la aprobación de cada solicitud dependen de su historial crediticio y del resultado de la evaluación del sistema. La presentación de una solicitud no garantiza su aprobación.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/puedo-solicitar-varios-prestamos/'
        },
        {
          label: '¿Cómo puedo aumentar mi límite de crédito y obtener más préstamos?\n',
          value: '<p>Para aumentar su límite de crédito y acceder a nuevas oportunidades de financiamiento:<br />• Realice sus pagos en las fechas establecidas.<br />• Utilice el crédito de manera responsable.<\/p>\n<p>Un buen historial crediticio puede aumentar sus posibilidades de obtener nuevos préstamos; un historial negativo puede limitar sus opciones. El incremento del límite y la aprobación de futuros préstamos están sujetos a evaluación.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/como-puedo-aumentar-mi-limite-de-credito-y-obtener-mas-prestamos/'
        }
      ]
    }
    ,
    {
      title: 'Seguridad y Privacidad',
      tab: [
        {
          label: '¿ALA es segura y legal?',
          value: '<p>ALA es una plataforma de crédito operada por una sociedad legalmente constituida en México como SOFOM, E.N.R. Sus operaciones se realizan de conformidad con la legislación aplicable.<\/p>\n<p>En la aplicación oficial de ALA puede consultar la información de sus préstamos, contratos, estados de cuenta, medios de pago y canales de atención. Si tiene dudas sobre la plataforma, su contrato o cualquier comisión, verifique la información directamente con el servicio oficial de atención al cliente.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/ala-es-segura-y-legal/'
        },
        {
          label: '¿Por qué canales oficiales se pondrá en contacto conmigo ALA?',
          value: '<p>ALA puede contactarle por SMS, llamada telefónica, WhatsApp o correo electrónico para enviarle notificaciones sobre su cuenta, recordatorios de pago o dar seguimiento a una solicitud de atención.<\/p>\n<p>Ni ALA ni sus representantes autorizados le pedirán que transfiera dinero a cuentas personales, comparta códigos de verificación o contraseñas, ni le amenazarán a usted o a sus contactos. Tampoco le ofrecerán de manera privada descuentos, quitas o condonaciones. Si recibe una comunicación de este tipo, no realice ningún pago y repórtela de inmediato a través de nuestros canales oficiales. <\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/por-que-canales-oficiales-se-pondra-en-contacto-conmigo-ala/'
        },
        {
          label: '¿Qué hago si recibo una llamada, SMS o WhatsApp que podría hacerse pasar por ALA?\n',
          value: '<p>No realice transferencias, no abra enlaces desconocidos y no comparta códigos de verificación, contraseñas, fotografías de su identificación ni datos bancarios. Abra la aplicación oficial de ALA para verificar su estado de cuenta y los medios de pago autorizados.<\/p>\n<p>Si le solicitan pagar a una cuenta personal o por un medio que no aparece en la aplicación, no efectúe el pago y repórtelo de inmediato.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/que-hago-si-recibo-una-llamada-sms-o-whatsapp-que-podria-hacerse-pasar-por-ala/'
        },
        {
          label: '¿Cómo reporto una app, cuenta o canal de pago falso que usa el nombre de ALA?',
          value: '<p>Conserve toda la evidencia disponible: nombre de la aplicación, enlace de descarga, capturas de pantalla, números telefónicos, cuenta receptora, comprobantes de transferencia y la identidad con la que se presentó la otra persona. Envíe esta información al servicio oficial de atención al cliente de ALA.<\/p>\n<p>Le ayudaremos a verificar si existe una suplantación de identidad o un uso indebido del nombre de ALA y le orientaremos sobre los pasos siguientes.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/como-reporto-una-app-cuenta-o-canal-de-pago-falso-que-usa-el-nombre-de-ala/'
        },
        {
          label: '¿Cómo puedo reportar una irregularidad o presentar una queja sobre el proceso de cobranza?',
          value: '<p>Si tienes dudas sobre el proceso de cobranza o consideras que recibes un trato inadecuado, o mensajes que no corresponden con el estado de tu préstamo, queremos conocer tu situación y apoyarte. <\/p>\n<p>Contacta a nuestro equipo de Atención al Cliente y comparte, de ser posible:<br />- La fecha y hora del contacto <br />- El número telefónico o medio por el que te contactaron <br />- Una breve descripción de lo sucedido <br />- Evidencia disponible, como capturas de pantalla, mensajes o grabaciones. <\/p>\n<p>Revisaremos tu reporte y te orientaremos sobre los siguientes pasos. <br />Recuerda: nunca realices pagos a cuentas personales ni compartas contraseñas ni códigos de verificación.<\/p>\n<p>Contáctanos únicamente a través de nuestros canales oficiales:<br />Líneas gratuitas: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/como-puedo-reportar-una-irregularidad-o-presentar-una-queja-sobre-el-proceso-de-cobranza/'
        },
        {
          label: '¿Qué hago si no reconozco una deuda o un préstamo a mi nombre?',
          value: '<p>Si identificas un préstamo o deuda de ALA que no reconoces, comunícate de inmediato con nuestro equipo de Atención al Cliente para solicitar una aclaración. <\/p>\n<p>Revisaremos la información relacionada con la solicitud, la verificación de la identidad y el desembolso del préstamo para investigar lo ocurrido y orientarte sobre los siguientes pasos. <\/p>\n<p>Por tu seguridad, no realices pagos a cuentas personales ni compartas contraseñas o códigos de verificación. <\/p>\n<p>Si necesitas ayuda, contáctanos únicamente a través de nuestros canales oficiales:<br />Líneas gratuitas: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/que-hago-si-no-reconozco-una-deuda-o-un-prestamo-a-mi-nombre/'
        },
        {
          label: '¿ALA es una app de "Montadeudas"?',
          value: '<p>No. ALA es operada por Quantum Wealth Solutions, S.A.P.I. de C.V., SOFOM, E.N.R. Mantenemos información clara sobre los costos del préstamo: el monto, el plazo, la tasa de interés y los cargos aplicables se muestran de forma explícita en la App oficial de ALA y en el contrato del préstamo, para que puedas consultarlos y confirmarlos antes de contratar.<\/p>\n<p>ALA realiza la gestión de cobranza conforme a la legislación aplicable. Si tienes dudas o inconformidades relacionadas con los costos del préstamo, la información de pago o las prácticas de cobranza, comunícate con nosotros a través de los canales oficiales de atención al cliente de ALA. Te ayudaremos a revisar tu caso y darle el seguimiento correspondiente.<\/p>\n<p>Si recibes mensajes sospechosos, te pedimos verificarlos y reportarlos a través de los canales oficiales de ALA:<br />Líneas gratuitas: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/ala-es-una-app-de-montadeudas/'
        }
      ]
    }
    ,
    {
      title: 'Problemas de Cuenta',
      tab: [
        {
          label: '¿Cómo puedo crear mi cuenta ALA?\n',
          value: '<p>Descargue la aplicación oficial de ALA desde Google Play o App Store y siga las instrucciones en pantalla para registrar su número de teléfono, datos de identificación y cuenta bancaria, así como para completar la verificación de identidad.<\/p>\n<p>La información proporcionada debe ser verdadera, completa y vigente. De lo contrario, podría afectar la evaluación de su solicitud, el desembolso, la validación de sus pagos o la seguridad de su cuenta.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>\n<p><br /><br /><\/p>',
          url: './article/como-puedo-crear-mi-cuenta-ala/'
        },
        {
          label: '¿Qué hago si me roban o pierdo mi celular?\n',
          value: '<p>Si perdió su teléfono y necesita cambiar con urgencia el número registrado, siga estos pasos para proteger su cuenta y recuperar el acceso:<br />1. Descargue la aplicación oficial de ALA en su nuevo teléfono y regístrese o inicie sesión con su nuevo número.<br />2. Inicie normalmente la solicitud de crédito dentro de la aplicación.<br />3. Durante el paso de carga de su INE, el sistema activará el proceso para cambiar el número registrado. Siga las instrucciones que aparecen en pantalla.<\/p>\n<p>Para proteger su cuenta, el equipo de atención al cliente verificará su identidad antes de brindarle asistencia.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/que-hago-si-me-roban-o-pierdo-mi-celular/'
        },
        {
          label: '¿Cómo actualizo mi número de teléfono, correo, WhatsApp o datos personales?\n',
          value: '<p>Por motivos de seguridad, ciertos datos no pueden modificarse directamente. Ingrese primero a la aplicación oficial de ALA y siga las instrucciones disponibles para actualizar su información. Si la opción que necesita no está disponible, comuníquese con el servicio oficial de atención al cliente.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/como-actualizo-mi-numero-de-telefono-correo-whatsapp-o-datos-personales/'
        },
        {
          label: '¿Cómo cambio mi cuenta bancaria o CLABE para recibir el préstamo?\n',
          value: '<p>Para cambiar la cuenta bancaria asociada, primero debe registrar una nueva cuenta. Ingrese a la aplicación de ALA y seleccione: 【Mi cuenta】 → 【Gestión de tarjetas bancarias】 → 【Agregar tarjeta bancaria】. Después, capture los datos solicitados para completar la vinculación.<\/p>\n<p>Importante: para recibir y pagar un préstamo, únicamente se admiten cuentas o tarjetas de débito personales a nombre del titular del préstamo.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/como-cambio-mi-cuenta-bancaria-o-clabe-para-recibir-el-prestamo/'
        }
      ]
    }
    ,
    {
      title: 'Pago y Reembolso',
      tab: [
        {
          label: '¿Puedo liquidar anticipadamente mi préstamo ALA?\n',
          value: '<p>Puede pagar su préstamo en la fecha de vencimiento o antes. ALA no ofrece un descuento por el solo hecho de realizar una liquidación anticipada.<\/p>\n<p>Antes de liquidar, consulte el monto vigente en la aplicación oficial de ALA o comuníquese con el servicio oficial de atención al cliente para confirmar el saldo total y el procedimiento. No pague montos comunicados de manera privada por terceros.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/puedo-liquidar-anticipadamente-mi-prestamo-ala/'
        },
        {
          label: '¿Dónde puedo ver mi fecha de pago y monto a pagar?\n',
          value: '<p>Para consultar la fecha de pago, el monto de cada parcialidad, el total a pagar, el saldo pendiente y el estado de su préstamo, ingrese a la aplicación de ALA y seleccione: 【Mi cuenta】 → 【Mis préstamos】.<\/p>\n<p>Si el monto o la fecha mostrados no coinciden con sus registros, comuníquese lo antes posible con el servicio oficial de atención al cliente para solicitar una revisión.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/donde-puedo-ver-mi-fecha-de-pago-y-monto-a-pagar/'
        },
        {
          label: '¿Cuáles son los métodos oficiales de pago para mi préstamo ALA?\n',
          value: '<p>Utilice únicamente los medios de pago vigentes que aparecen en la aplicación oficial de ALA. Antes de pagar, verifique el monto, la cuenta o referencia de pago, los datos del beneficiario y la fecha de vencimiento.<\/p>\n<p>No realice pagos a cuentas personales, mediante enlaces desconocidos ni a cuentas que no aparezcan en la aplicación.<\/p>\n<p>Si necesita ayuda, comuníquese con nosotros únicamente a través de nuestros canales oficiales:<br />Líneas de atención sin costo: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/cuales-son-los-metodos-oficiales-de-pago-para-mi-prestamo-ala/'
        },
        {
          label: 'Estoy al corriente ¿por qué recibo mensajes de cobranza?',
          value: '<p>Si ya realizaste tu pago, pero aún no aparece reflejado en la app de ALA o sigues recibiendo mensajes de cobranza, es posible que el pago todavía esté en proceso de actualización.<\/p>\n<p>Por lo general, los pagos se reflejan en aproximadamente 2 horas, aunque en algunos casos pueden demorar más por cuestiones operativas o bancarias. Una vez procesado, recibirás un SMS de confirmación.<\/p>\n<p>Si han pasado más de 24 horas sin recibir la confirmación, o continúas recibiendo avisos de cobranza después de que tu pago se haya registrado, contáctanos y comparte tu comprobante para que podamos revisar tu caso.<\/p>\n<p>Si necesitas ayuda, contáctanos únicamente a través de nuestros canales oficiales:<br />Líneas gratuitas: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/estoy-al-corriente-por-que-recibo-mensajes-de-cobranza/'
        },
        {
          label: 'Si tengo dificultades para pagar, ¿puedo llegar a un acuerdo con ALA?',
          value: '<p>Si estás pasando por una situación que te dificulta realizar tus pagos, queremos escucharte y ayudarte a conocer tus opciones.<\/p>\n<p>Te recomendamos comunicarte lo antes posible con nuestro equipo de Atención al Cliente para explicarnos tu situación.<\/p>\n<p>Revisaremos tu caso considerando las condiciones de tu préstamo y nuestras políticas vigentes, y te informaremos si existen alternativas disponibles para ti. Cualquier ajuste o acuerdo estará sujeto a evaluación y aprobación.<\/p>\n<p>¿Necesitas ayuda? Contáctanos únicamente a través de nuestros canales oficiales.<br />Líneas gratuitas: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/si-tengo-dificultades-para-pagar-puedo-llegar-a-un-acuerdo-con-ala/'
        },
        {
          label: '¿Qué debo hacer si no puedo pagar a tiempo?',
          value: '<p>Si crees que no podrás realizar tu pago a tiempo, te recomendamos abonar lo más posible para reducir tu saldo pendiente y comunicarte con nuestro equipo de Atención al Cliente, de preferencia antes de tu fecha de vencimiento.<\/p>\n<p>De acuerdo con tu contrato, los pagos atrasados pueden generar cargos adicionales y afectar tu historial crediticio. Puedes consultar tu saldo actualizado y el desglose de los montos a pagar directamente en la app de ALA.<\/p>\n<p>Si tienes dificultades para pagar, contáctanos para revisar tu situación. Evaluaremos tu caso de acuerdo con las condiciones de tu préstamo y nuestras políticas vigentes, y te informaremos sobre las alternativas disponibles.<\/p>\n<p>Por tu seguridad: ALA podrá enviarte recordatorios de pago a través de sus canales oficiales. Nunca realices transferencias a cuentas personales ni compartas contraseñas o códigos de verificación.<\/p>\n<p>¿Necesitas ayuda? Contáctanos a través de nuestros canales oficiales:<br />Líneas gratuitas: 800 953 0794 y 800 288 3450<br />Chat&#xff1a;<a href=\"./channel/help-center/\" rel=\"noopener noreferrer\">Contactar con atención al cliente<\/a><\/p>',
          url: './article/que-debo-hacer-si-no-puedo-pagar-a-tiempo/'
        }
      ]
    }
  ];

  const tablist = section.querySelector('[role=tablist]');
  const panel = section.querySelector('[role=tabpanel]');
  const visibleCategories = categories.slice(0, 4);

  function selectCategory(index) {
    for (const [position, tab] of [...tablist.children].entries()) {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }

    panel.setAttribute('aria-labelledby', tablist.children[index].id);
    panel.replaceChildren(...visibleCategories[index].tab.slice(0, 4).map(({label, value, url}) => {
      const item = document.createElement('details');
      item.className = 'ala-faq-item';
      item.setAttribute('name', 'home-faq');

      const question = document.createElement('summary');
      question.className = 'ala-faq-toggle';
      question.textContent = label;

      const answer = document.createElement('div');
      answer.className = 'ala-faq-answer';
      answer.innerHTML = value;
      for (const link of answer.querySelectorAll('a[href]')) {
        link.href = new URL(link.getAttribute('href'), root);
        if (section.dataset.alaFaq === 'city' && link.href === helpUrl) link.target = '_blank';
      }
      if (url) {
        const link = document.createElement('a');
        link.className = 'ala-faq-detail';
        link.href = new URL(url, root);
        link.textContent = 'Ver detalles';
        answer.append(link);
      }

      item.append(question, answer);
      return item;
    }));
  }

  for (const [index, category] of visibleCategories.entries()) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'ala-category-tab';
    tab.id = 'home-faq-tab-' + index;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    tab.textContent = category.title;
    tab.addEventListener('click', () => selectCategory(index));
    tab.addEventListener('keydown', event => {
      const count = visibleCategories.length;
      const targets = { ArrowLeft: (index + count - 1) % count, ArrowRight: (index + 1) % count, Home: 0, End: count - 1 };
      if (!Object.hasOwn(targets, event.key)) return;
      event.preventDefault();
      const next = targets[event.key];
      selectCategory(next);
      tablist.children[next].focus();
    });
    tablist.append(tab);
  }

  selectCategory(0);
})();
