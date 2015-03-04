create table $schema$_schema (
	_id $id$ not null,
	_name $string$,
	_code $string$,
	_description $text$,
	_opts $text$
) $tablespace$;

create table $schema$_revision (
	_id $id$ not null,
	_subject_id $number$,
	_date $timestamp$,
	_description $text$,
	_remote_addr $string$,
	_opts $text$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

create table $schema$_class (
	_id $id$ not null,
	_parent_id $number$,
	_name $string$,
	_code $string$,
	_description $text$,
	_namespace $number$
	_opts $text$,
	_start_id $number$,
	_end_id $number$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

create table $schema$_class_attr (
	_id $id$ not null,
	_class_id $number$,
	_name $string$,
	_code $string$,
	_description $text$,
	_type_id $number$,
	_opts $text$,
	_start_id $number$,
	_end_id $number$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

create table $schema$_object (
	_id $id$ not null,
	_class_id $number$,
	_opts $text$,
	_start_id $number$,
	_end_id $number$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

create table $schema$_object_attr (
	_id $id$ not null,
	_object_id $number$,
	_class_attr_id $number$,
	_string $string_value$,
	_number $number_value$,
	_time $timestamp$,
	_opts $text$,
	_start_id $number$,
	_end_id $number$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

create table $schema$_view (
	_id $id$ not null,
	_parent_id $number$,
	_name $string$,
	_code $string$,
	_description $text$,
	_layout $text$,
	_query $text$,
	_icon_cls $tstring$
	_opts $text$,
	_start_id $number$,
	_end_id $number$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

create table $schema$_view_attr (
	_id $id$ not null,
	_view_id $number$,
	_name $string$,
	_code $string$,
	_description $text$,
	_class_id $number$,
	_class_attr_id $number$,
	_order $number_value$,
	_area $number$,
	_width $number_value$,
	_opts $text$,
	_start_id $number$,
	_end_id $number$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

create table $schema$_action (
	_id $id$ not null,
	_class_id $number$,
	_name $string$,
	_code $string$,
	_description $text$,
	_body $text$,
	_opts $text$,
	_start_id $number$,
	_end_id $number$,
	_schema_id $number$,
	_record_id $number$
) $tablespace$;

