create unique index _project_id on <%=schema%>_project (_id) <%=tablespace%>;

create unique index _revision_id on <%=schema%>_revision (_id) <%=tablespace%>;
create index _revision_date on <%=schema%>_revision (_date) <%=tablespace%>;
create index _revision_project_id on <%=schema%>_revision (_project_id) <%=tablespace%>;
create index _revision_record_id on <%=schema%>_revision (_record_id) <%=tablespace%>;

create index _class_id on <%=schema%>_class (_id) <%=tablespace%>;
create index _class_name on <%=schema%>_class (_name);
create index _class_code on <%=schema%>_class (_code);
create index _class_parent_id on <%=schema%>_class (_parent_id) <%=tablespace%>;
create index _class_start_id on <%=schema%>_class (_start_id) <%=tablespace%>;
create index _class_end_id on <%=schema%>_class (_end_id) <%=tablespace%>;
create index _class_project_id on <%=schema%>_class (_project_id) <%=tablespace%>;
create index _class_record_id on <%=schema%>_class (_record_id) <%=tablespace%>;

create index _class_attr_id on <%=schema%>_class_attr (_id) <%=tablespace%>;
create index _class_attr_class_id on <%=schema%>_class_attr (_class_id) <%=tablespace%>;
create index _class_attr_name on <%=schema%>_class_attr (_name);
create index _class_attr_code on <%=schema%>_class_attr (_code);
create index _class_attr_type_id on <%=schema%>_class_attr (_type_id) <%=tablespace%>;
create index _class_attr_start_id on <%=schema%>_class_attr (_start_id) <%=tablespace%>;
create index _class_attr_end_id on <%=schema%>_class_attr (_end_id) <%=tablespace%>;
create index _class_attr_project_id on <%=schema%>_class_attr (_project_id) <%=tablespace%>;
create index _class_attr_record_id on <%=schema%>_class_attr (_record_id) <%=tablespace%>;

create index _object_id on <%=schema%>_object (_id) <%=tablespace%>;
create index _object_class_id on <%=schema%>_object (_class_id) <%=tablespace%>;
create index _object_start_id on <%=schema%>_object (_start_id) <%=tablespace%>;
create index _object_end_id on <%=schema%>_object (_end_id) <%=tablespace%>;
create index _object_project_id on <%=schema%>_object (_project_id) <%=tablespace%>;
create index _object_record_id on <%=schema%>_object (_record_id) <%=tablespace%>;

create index _object_attr_id on <%=schema%>_object_attr (_id) <%=tablespace%>;
create index _object_attr_class_attr_id on <%=schema%>_object_attr (_class_attr_id) <%=tablespace%>;
create index _object_attr_object_id on <%=schema%>_object_attr (_object_id) <%=tablespace%>;
create index _object_attr_start_id on <%=schema%>_object_attr (_start_id) <%=tablespace%>;
create index _object_attr_end_id on <%=schema%>_object_attr (_end_id) <%=tablespace%>;
create index _object_attr_project_id on <%=schema%>_object_attr (_project_id) <%=tablespace%>;
create index _object_attr_record_id on <%=schema%>_object_attr (_record_id) <%=tablespace%>;

create index _view_id on <%=schema%>_view (_id) <%=tablespace%>;
create index _view_name on <%=schema%>_view (_name);
create index _view_code on <%=schema%>_view (_code);
create index _view_parent_id on <%=schema%>_view (_parent_id) <%=tablespace%>;
create index _view_start_id on <%=schema%>_view (_start_id) <%=tablespace%>;
create index _view_end_id on <%=schema%>_view (_end_id) <%=tablespace%>;
create index _view_project_id on <%=schema%>_view (_project_id) <%=tablespace%>;
create index _view_record_id on <%=schema%>_view (_record_id) <%=tablespace%>;

create index _query_id on <%=schema%>_query (_id) <%=tablespace%>;
create index _query_name on <%=schema%>_query (_name);
create index _query_code on <%=schema%>_query (_code);
create index _query_parent_id on <%=schema%>_query (_parent_id) <%=tablespace%>;
create index _query_start_id on <%=schema%>_query (_start_id) <%=tablespace%>;
create index _query_end_id on <%=schema%>_query (_end_id) <%=tablespace%>;
create index _query_project_id on <%=schema%>_query (_project_id) <%=tablespace%>;
create index _query_record_id on <%=schema%>_query (_record_id) <%=tablespace%>;

create index _query_attr_id on <%=schema%>_query_attr (_id) <%=tablespace%>;
create index _query_attr_code on <%=schema%>_query_attr (_code) <%=tablespace%>;
create index _query_attr_name on <%=schema%>_query_attr (_name) <%=tablespace%>;
create index _query_attr_query_id on <%=schema%>_query_attr (_query_id) <%=tablespace%>;
create index _query_attr_start_id on <%=schema%>_query_attr (_start_id) <%=tablespace%>;
create index _query_attr_end_id on <%=schema%>_query_attr (_end_id) <%=tablespace%>;
create index _query_attr_project_id on <%=schema%>_query_attr (_project_id) <%=tablespace%>;
create index _query_attr_record_id on <%=schema%>_query_attr (_record_id) <%=tablespace%>;

create index _action_id on <%=schema%>_action (_id) <%=tablespace%>;
create index _action_name on <%=schema%>_action (_name);
create index _action_code on <%=schema%>_action (_code);
create index _action_class_id on <%=schema%>_action (_class_id) <%=tablespace%>;
create index _action_action_id on <%=schema%>_action (_action_id) <%=tablespace%>;
create index _action_start_id on <%=schema%>_action (_start_id) <%=tablespace%>;
create index _action_end_id on <%=schema%>_action (_end_id) <%=tablespace%>;
create index _action_project_id on <%=schema%>_action (_project_id) <%=tablespace%>;
create index _action_record_id on <%=schema%>_action (_record_id) <%=tablespace%>;
