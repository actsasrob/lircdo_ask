#!/usr/bin/env python3

import sys
import json

def build_dict(seq, key):
	    return dict((d[key], dict(d, index=index)) for (index, d) in enumerate(seq))

with open(sys.argv[1], 'r') as f:
    the_model = json.load(f)

interaction_model = the_model.get("interactionModel")
language_model = interaction_model.get("languageModel")
#print("%s" % language_model)

types = language_model.get("types")
#print("%s" % types)
types_index = build_dict(types, key="name")
tom_info = types_index.get("LIRC_ACTION")
types_ordered = [types_index.get("LIRC_ACTION"), types_index.get("LIRC_COMPONENT"), types_index.get("LIRC_AVR_ACTION"), types_index.get("LIRC_AV_DEVICE"), types_index.get("LIRC_CHANNEL_ACTION"), types_index.get("LIRC_VOLUME_ACTION")]
for type in types_ordered:
	#print("type %s\n" % (type.get("name")))
	type_name = type.get("name")
	type_values = type.get("values") 
	print("### %s Slot\n" % (type_name))
	print("| What you can say | lircdo server meta Key & Value |")
	print("|-----|-----|")
	for type_value in type_values:
		type_value_id = type_value.get("id")
		type_value_name = type_value.get("name")
		type_value_name_value = type_value_name.get("value")
		type_value_name_synonyms = []
		if "synonyms" in type_value_name:
			type_value_name_synonyms = type_value_name.get("synonyms")
		print('| "%s"' % (type_value_name_value), end='')
		if (len(type_value_name_synonyms) > 0):
			for synonym in type_value_name_synonyms:
				print(',"%s"' % (synonym), end='')
		key_type = "component"
		if "ACTION" in type_name:
			key_type="action"
		print("| %s=%s |" % (key_type, type_value_id))
	print("")
