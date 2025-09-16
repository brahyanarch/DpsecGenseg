erDiagram
    users ||--o{ user_subunits : "pertenece"
    users ||--o{ activities : "crea"
    subunits ||--o{ user_subunits : "contiene"
    subunits ||--o{ projects : "gestiona"
    subunits ||--o{ forms : "configura"
    projects ||--o{ activities : "contiene"
    activities ||--o{ activity_responses : "tiene"
    forms ||--o{ questions : "contiene"
    forms ||--o{ activities : "usado_en"
    questions ||--o{ options : "opciones"
    questions ||--o{ activity_responses : "respondido_en"
    roles ||--o{ user_subunits : "asignado"
    roles ||--o{ role_permissions : "tiene"
    permissions ||--o{ role_permissions : "incluido"

    users {
        int id PK
        varchar name
        varchar email
        varchar password
        datetime created_at
    }
    
    subunits {
        int id PK
        varchar name
        text description
    }
    
    user_subunits {
        int user_id FK
        int subunit_id FK
        int role_id FK
        bool is_active
        PK(user_id, subunit_id)
    }
    
    roles {
        int id PK
        varchar name
    }
    
    permissions {
        int id PK
        varchar code
        varchar description
    }
    
    role_permissions {
        int role_id FK
        int permission_id FK
        PK(role_id, permission_id)
    }
    
    projects {
        int id PK
        varchar name
        enum status 'Pendiente,En_curso,Completado,Archivado'
        int subunit_id FK
        int created_by FK
        datetime created_at
    }
    
    activities {
        int id PK
        varchar name
        date start_date
        date end_date
        int project_id FK
        int form_id FK
        int created_by FK
    }
    
    forms {
        int id PK
        varchar title
        int subunit_id FK
        bool is_active
        int created_by FK
        datetime created_at
    }
    
    questions {
        int id PK
        text question_text
        enum type 'textual,opcion_unica,opcion_multiple,desplegable,fecha'
        bool is_required
        int form_id FK
        int order
    }
    
    options {
        int id PK
        varchar value
        int question_id FK
    }
    
    activity_responses {
        int id PK
        int activity_id FK
        int question_id FK
        text text_response
        int option_id FK NULL
        datetime date_response NULL
    }