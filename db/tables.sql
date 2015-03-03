create table $schema$_schema (
	_id $id$ not null,
	_name $string$,
	_code $string$,
	_description $text$,
	_opts $text$
) $tablespace$;

create table $schema$_revision (
	_id $id$ not null,
	_subject_id $id$,
	_date $timestamp$,
	_description $text$,
	_remote_addr $string$,
	_opts $text$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

create table $schema$_class (
	_id $id$ not null,
	_parent_id $id$,
	_name $string$,
	_code $string$,
	_description $text$,
	_namespace $id$
	_opts $text$,
	_start_id $id$,
	_end_id $id$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

create table $schema$_class_attr (
	_id $id$ not null,
	_class_id $id$,
	_name $string$,
	_code $string$,
	_description $text$,
	_type_id $id$,
	_opts $text$,
	_start_id $id$,
	_end_id $id$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

create table $schema$_object (
	_id $id$ not null,
	_class_id $id$,
	_opts $text$,
	_start_id $id$,
	_end_id $id$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

create table $schema$_object_attr (
	_id $id$ not null,
	_object_id $id$,
	_class_attr_id $id$,
	_string $string_value$,
	_number $number_value$,
	_time $timestamp$,
	_opts $text$,
	_start_id $id$,
	_end_id $id$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

create table $schema$_view (
	_id $id$ not null,
	_parent_id $id$,
	_name $string$,
	_code $string$,
	_description $text$,
	_layout $text$,
	_query $text$,
	_icon_cls $tstring$
	_opts $text$,
	_start_id $id$,
	_end_id $id$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

create table $schema$_view_attr (
	_id $id$ not null,
	_view_id $id$,
	_name $string$,
	_code $string$,
	_description $text$,
	_class_id $id$,
	_class_attr_id $id$,
	_order $number_value$,
	_area $id$,
	_width $number_value$,
	_opts $text$,
	_start_id $id$,
	_end_id $id$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

create table $schema$_action (
	_id $id$ not null,
	_class_id $id$,
	_name $string$,
	_code $string$,
	_description $text$,
	_body $text$,
	_opts $text$,
	_start_id $id$,
	_end_id $id$,
	_schema_id $id$,
	_record_id $id$
) $tablespace$;

