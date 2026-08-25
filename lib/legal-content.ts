export type LegalLocale = 'es' | 'en'
export type LegalKind = 'privacy' | 'terms'

export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
  contactEmail?: string
}

export type LegalDocument = {
  kind: LegalKind
  locale: LegalLocale
  eyebrow: string
  title: string
  summary: string
  effectiveDate: string
  provider: string
  sections: LegalSection[]
}

const email = 'hola@agenteagora.com'

const documents: Record<LegalLocale, Record<LegalKind, LegalDocument>> = {
  es: {
    privacy: {
      kind: 'privacy',
      locale: 'es',
      eyebrow: 'Legal',
      title: 'Política de Privacidad',
      summary: 'Cómo Agora recopila, usa y protege la información relacionada con el servicio.',
      effectiveDate: '24 de agosto de 2026',
      provider: 'Agente Agora LLC',
      sections: [
        { id: 'controller', title: 'Responsable y contacto', paragraphs: ['Agente Agora LLC es responsable del tratamiento de la información descrita en esta política. Para consultas sobre privacidad, escríbenos a la dirección indicada abajo.'], contactEmail: email },
        { id: 'data-collected', title: 'Información que recopilamos', paragraphs: ['Recopilamos la información que proporcionas al contactar con Agora, crear una cuenta o usar el servicio, como tu nombre, correo electrónico, empresa, datos de inicio de sesión y la información necesaria para operar las funciones que eliges usar. También podemos recibir datos técnicos básicos, como registros de uso, dirección IP, tipo de navegador y diagnósticos de seguridad.'] },
        { id: 'google-login', title: 'Inicio de sesión con Google', paragraphs: ['Cuando eliges iniciar sesión con Google, recibimos solo datos básicos de identidad: nombre, dirección de correo electrónico, imagen de perfil e identificador de cuenta de Google. Usamos esa información únicamente para autenticarte y administrar tu cuenta.', 'Agora no solicita acceso a Gmail, Google Drive, Google Calendar ni a otro contenido de Google Workspace. Agora no vende datos de usuarios de Google ni los usa para publicidad.'] },
        { id: 'uses', title: 'Cómo usamos la información', paragraphs: ['Usamos la información para proporcionar, mantener y mejorar Agora, responder solicitudes, administrar cuentas, proteger el servicio, cumplir obligaciones aplicables y comunicarnos sobre asuntos operativos. No usamos información personal para fines incompatibles con esta política.'] },
        { id: 'processors', title: 'Proveedores de servicios', paragraphs: ['Podemos compartir información con proveedores que nos ayudan a alojar, proteger, analizar o prestar el servicio. Estos proveedores solo pueden tratar la información siguiendo nuestras instrucciones y para las finalidades descritas aquí.'] },
        { id: 'retention', title: 'Conservación', paragraphs: ['Conservamos la información durante el tiempo necesario para prestar el servicio, mantener registros operativos y de seguridad, resolver disputas y cumplir obligaciones aplicables. Cuando ya no sea necesaria, la eliminamos o anonimizamos de acuerdo con nuestros procesos.'] },
        { id: 'security', title: 'Seguridad', paragraphs: ['Aplicamos medidas técnicas y organizativas razonables para proteger la información contra acceso, uso, pérdida o divulgación no autorizados. Ningún sistema puede garantizar seguridad absoluta, por lo que también pedimos que protejas tus credenciales.'] },
        { id: 'transfers', title: 'Transferencias internacionales', paragraphs: ['La información puede ser procesada en países distintos de aquel donde se recopiló cuando sea necesario para operar Agora o trabajar con proveedores. Aplicamos medidas razonables para que ese tratamiento mantenga las protecciones descritas en esta política.'] },
        { id: 'rights', title: 'Tus derechos', paragraphs: ['Según la normativa aplicable, puedes solicitar acceso, corrección, eliminación, restricción u oposición al tratamiento de tu información, así como recibir una copia cuando corresponda. Contáctanos para ejercer estos derechos.'], contactEmail: email },
        { id: 'children', title: 'Menores de edad', paragraphs: ['Agora no está dirigido a menores de edad ni recopilamos deliberadamente información personal de menores. Si crees que un menor nos proporcionó información, contáctanos para que podamos revisarlo.'] },
        { id: 'updates', title: 'Actualizaciones de esta política', paragraphs: ['Podemos actualizar esta política cuando cambien nuestras prácticas, el servicio o requisitos aplicables. Publicaremos la versión actualizada con una nueva fecha de vigencia.'] },
      ],
    },
    terms: {
      kind: 'terms',
      locale: 'es',
      eyebrow: 'Legal',
      title: 'Términos de Servicio',
      summary: 'Las reglas básicas para acceder y utilizar Agora.',
      effectiveDate: '24 de agosto de 2026',
      provider: 'Agente Agora LLC',
      sections: [
        { id: 'acceptance', title: 'Aceptación y autoridad', paragraphs: ['Al acceder o usar Agora aceptas estos términos. Si utilizas el servicio en nombre de una organización, declaras que tienes autoridad para aceptar estos términos en su nombre.'] },
        { id: 'accounts-security', title: 'Cuentas y seguridad', paragraphs: ['Debes proporcionar información exacta al crear una cuenta y mantener protegidas tus credenciales. Eres responsable de las actividades realizadas desde tu cuenta y debes avisarnos de inmediato si detectas un uso no autorizado.'] },
        { id: 'service', title: 'El servicio', paragraphs: ['Agora ofrece herramientas operativas y de gestión documental para apoyar procesos de exportación. Podemos actualizar, mantener o modificar funciones para mejorar el servicio, su seguridad o su disponibilidad.'] },
        { id: 'acceptable-use', title: 'Uso aceptable', paragraphs: ['No puedes usar Agora de forma ilegal, infringir derechos de terceros, interferir con el servicio, intentar acceder sin autorización, introducir código dañino ni usar el servicio para distribuir contenido abusivo o fraudulento.'] },
        { id: 'customer-content', title: 'Contenido del cliente', paragraphs: ['Conservas la titularidad de tu contenido. Nos otorgas los permisos limitados necesarios para alojar, procesar y mostrar ese contenido únicamente con el fin de prestar y mejorar el servicio según tus instrucciones.'] },
        { id: 'third-party-authentication', title: 'Autenticación de terceros', paragraphs: ['Puedes usar un proveedor externo, como Google, para autenticarte. El uso de esos servicios también está sujeto a los términos y políticas del proveedor correspondiente. Agora solo recibe la información necesaria para la autenticación descrita en nuestra Política de Privacidad.'] },
        { id: 'confidentiality', title: 'Confidencialidad', paragraphs: ['Cada parte debe proteger la información confidencial de la otra y usarla solo para la relación de servicio, salvo que sea necesario divulgarla por ley o a proveedores sujetos a obligaciones de confidencialidad.'] },
        { id: 'subscriptions-order-forms', title: 'Suscripciones y órdenes', paragraphs: ['Cualquier suscripción, orden o acuerdo comercial aplicable puede describir servicios, plazos y condiciones adicionales. Si existe un acuerdo escrito aplicable, sus términos prevalecen sobre estos términos cuando haya conflicto.'] },
        { id: 'suspension-termination', title: 'Suspensión y terminación', paragraphs: ['Podemos suspender o terminar el acceso cuando sea razonablemente necesario para proteger el servicio, responder a un uso indebido, cumplir obligaciones aplicables o ante un incumplimiento de estos términos. Puedes dejar de usar el servicio en cualquier momento.'] },
        { id: 'disclaimers', title: 'Avisos y límites permitidos por la ley', paragraphs: ['El servicio se proporciona según esté disponible. En la medida permitida por la ley aplicable, no garantizamos que el servicio sea ininterrumpido, libre de errores o adecuado para todas las necesidades. Nada en estos términos limita derechos que no puedan excluirse legalmente.'] },
        { id: 'changes', title: 'Cambios a estos términos', paragraphs: ['Podemos actualizar estos términos cuando cambie el servicio o existan requisitos aplicables. Publicaremos los términos actualizados y la fecha de vigencia. El uso continuado después de la entrada en vigor significa que aceptas los términos actualizados.'] },
        { id: 'contact', title: 'Contacto', paragraphs: ['Para preguntas sobre estos términos, contáctanos en la siguiente dirección.'], contactEmail: email },
      ],
    },
  },
  en: {
    privacy: {
      kind: 'privacy',
      locale: 'en',
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      summary: 'How Agora collects, uses, and protects information connected to the service.',
      effectiveDate: 'August 24, 2026',
      provider: 'Agente Agora LLC',
      sections: [
        { id: 'controller', title: 'Controller and contact', paragraphs: ['Agente Agora LLC is responsible for the processing described in this policy. For privacy questions, contact us at the address below.'], contactEmail: email },
        { id: 'data-collected', title: 'Information we collect', paragraphs: ['We collect information you provide when you contact Agora, create an account, or use the service, including your name, email address, company, sign-in details, and information needed to operate the features you choose to use. We may also receive basic technical information such as usage logs, IP address, browser type, and security diagnostics.'] },
        { id: 'google-login', title: 'Sign in with Google', paragraphs: ['When you choose to sign in with Google, we receive only basic identity information: name, email address, profile image, and Google account identifier. We use that information only to authenticate you and administer your account.', 'Agora does not request access to Gmail, Google Drive, Google Calendar, or other Google Workspace content. Agora does not sell Google user data or use it for advertising.'] },
        { id: 'uses', title: 'How we use information', paragraphs: ['We use information to provide, maintain, and improve Agora, respond to requests, administer accounts, protect the service, meet applicable obligations, and communicate about operational matters. We do not use personal information for purposes incompatible with this policy.'] },
        { id: 'processors', title: 'Service providers', paragraphs: ['We may share information with providers that help us host, secure, analyze, or deliver the service. These providers may process information only under our instructions and for the purposes described here.'] },
        { id: 'retention', title: 'Retention', paragraphs: ['We retain information for as long as needed to provide the service, maintain operational and security records, resolve disputes, and meet applicable obligations. When information is no longer needed, we delete or anonymize it through our processes.'] },
        { id: 'security', title: 'Security', paragraphs: ['We use reasonable technical and organizational measures to protect information from unauthorized access, use, loss, or disclosure. No system can guarantee absolute security, so please also protect your credentials.'] },
        { id: 'transfers', title: 'International transfers', paragraphs: ['Information may be processed in countries other than where it was collected when needed to operate Agora or work with service providers. We use reasonable measures so that processing maintains the protections described in this policy.'] },
        { id: 'rights', title: 'Your rights', paragraphs: ['Depending on applicable law, you may request access, correction, deletion, restriction, or objection to the processing of your information, and receive a copy where applicable. Contact us to exercise these rights.'], contactEmail: email },
        { id: 'children', title: 'Children', paragraphs: ['Agora is not directed to children, and we do not knowingly collect personal information from children. If you believe a child has provided us information, contact us so we can review it.'] },
        { id: 'updates', title: 'Updates to this policy', paragraphs: ['We may update this policy when our practices, the service, or applicable requirements change. We will publish the updated version with a new effective date.'] },
      ],
    },
    terms: {
      kind: 'terms',
      locale: 'en',
      eyebrow: 'Legal',
      title: 'Terms of Service',
      summary: 'The basic rules for accessing and using Agora.',
      effectiveDate: 'August 24, 2026',
      provider: 'Agente Agora LLC',
      sections: [
        { id: 'acceptance', title: 'Acceptance and authority', paragraphs: ['By accessing or using Agora, you accept these terms. If you use the service for an organization, you represent that you have authority to accept these terms for that organization.'] },
        { id: 'accounts-security', title: 'Accounts and security', paragraphs: ['You must provide accurate information when creating an account and keep your credentials protected. You are responsible for activity from your account and must promptly notify us if you discover unauthorized use.'] },
        { id: 'service', title: 'The service', paragraphs: ['Agora provides operational and document-management tools to support export processes. We may update, maintain, or modify features to improve the service, its security, or its availability.'] },
        { id: 'acceptable-use', title: 'Acceptable use', paragraphs: ['You may not use Agora unlawfully, infringe third-party rights, interfere with the service, attempt unauthorized access, introduce harmful code, or use the service to distribute abusive or fraudulent content.'] },
        { id: 'customer-content', title: 'Customer content', paragraphs: ['You retain ownership of your content. You grant us the limited permissions needed to host, process, and display that content solely to provide and improve the service according to your instructions.'] },
        { id: 'third-party-authentication', title: 'Third-party authentication', paragraphs: ['You may use an external provider, such as Google, to authenticate. Use of those services is also subject to the provider’s terms and policies. Agora receives only the authentication information described in our Privacy Policy.'] },
        { id: 'confidentiality', title: 'Confidentiality', paragraphs: ['Each party must protect the other’s confidential information and use it only for the service relationship, except where disclosure is required by law or made to service providers bound by confidentiality obligations.'] },
        { id: 'subscriptions-order-forms', title: 'Subscriptions and order forms', paragraphs: ['Any applicable subscription, order form, or commercial agreement may describe services, terms, and additional conditions. If an applicable written agreement exists, its terms control where they conflict with these terms.'] },
        { id: 'suspension-termination', title: 'Suspension and termination', paragraphs: ['We may suspend or terminate access when reasonably necessary to protect the service, address misuse, meet applicable obligations, or respond to a breach of these terms. You may stop using the service at any time.'] },
        { id: 'disclaimers', title: 'Disclaimers and lawful limits', paragraphs: ['The service is provided as available. To the extent permitted by applicable law, we do not guarantee that the service will be uninterrupted, error free, or suitable for every need. Nothing in these terms limits rights that cannot be legally excluded.'] },
        { id: 'changes', title: 'Changes to these terms', paragraphs: ['We may update these terms when the service changes or applicable requirements require it. We will publish updated terms and their effective date. Continued use after the effective date means you accept the updated terms.'] },
        { id: 'contact', title: 'Contact', paragraphs: ['For questions about these terms, contact us at the address below.'], contactEmail: email },
      ],
    },
  },
}

export function getLegalDocument(kind: LegalKind, locale: LegalLocale): LegalDocument {
  return documents[locale][kind]
}
