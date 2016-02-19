'use strict';

var i18n = {
    language: {
        "name"                  : "AC Seed",
    
        "id"                    : "ID",
        "home"                  : "Home",
        "view"                  : "View",
        "view_details"          : "View Details",
        "edit"                  : "Edit",
        "create"                : "Create",
        "read"                  : "Read",
        "update"                : "Update",
        "delete"                : "Delete",
        "save"                  : "Save",
        "save_and_close"        : "Save & Close",
        "close_without_saving"  : "Close Without Saving",
        "close"                 : "Close",
    
        "login"                 : "Login",
        "logout"                : "Logout",
        "register"              : "Register",
        "sign_in"               : "Sign in",
        "sign_up"               : "Sign up",
        "email"                 : "Email",
        "password"              : "Password",
        "confirm_password"      : "Confirm Password",
    
        "are_you_sure"          : "Are you sure?",
        "fill_out_login"        : "Please fill out the login form.",
        "you_may_login"         : "You may now login.",
        "passwords_not_match"   : "The passwords do not match.",
    
        "toggle_nav"            : "Toggle navigation",
        "admin_panel"           : "Administrator Panel",
        "search"                : "Search...",
        "dashboard"             : "Dashboard",
        "view_frontend"         : "View Frontend",
        "settings"              : "Settings",
    
        "users"                 : "Users",
        "user_updated"          : "User successfully updated.",
        "user_deleted"          : "User successfully deleted.",
        "user_profile"          : "User Profile",
        "view_user"             : "View User",
        "edit_user"             : "Edit User",
    
        "role"                  : "Role",
        "roles"                 : "Roles",
        "add_role"              : "Add Role",
        "view_role"             : "View Role",
        "edit_role"             : "Edit Role",
        "enter_role_name"       : "Please enter role name.",
        "role_added"            : "Role successfully added.",
        "role_deleted"          : "Role successfully deleted.",
        "role_updated"          : "Role successfully updated.",
        "role_name"             : "Role Name...",
    
        "resource"              : "Resource",
    
        "new_comments"          : "New Comments!",
        "new_tasks"             : "New Tasks!",
        "new_orders"            : "New Orders!",
        "support_tickets"       : "Support Tickets!",

        "required"              : "The %s field is required.",
        "isset"                 : "The %s field must have a value.",
        "valid_email"           : "The %s field must contain a valid email address.",
        "valid_emails"          : "The %s field must contain all valid email addresses.",
        "valid_url"             : "The %s field must contain a valid URL.",
        "valid_ip"              : "The %s field must contain a valid IP.",
        "min_length"            : "The %s field is too short.",
        "max_length"            : "The %s field contains too many characters.",
        "exact_length"          : "The %s field must be exactly %s characters in length.",
        "alpha"                 : "The %s field may only contain alphabetical characters.",
        "alpha_numeric"         : "The %s field may only contain alpha-numeric characters.",
        "alpha_dash"            : "The %s field may only contain alpha-numeric characters, underscores, and dashes.",
        "numeric"               : "The %s field must contain only numbers.",
        "is_numeric"            : "The %s field must contain only numeric characters.",
        "integer"               : "The %s field must contain an integer.",
        "regex_match"           : "The %s field is not in the correct format.",
        "matches"               : "The %s field does not match the %s field.",
        "is_unique"             : "The %s you provided is already in use.",
        "is_natural"            : "The %s field must contain only positive numbers.",
        "is_natural_no_zero"    : "The %s field must contain a number greater than zero.",
        "decimal"               : "The %s field must contain a decimal number.",
        "less_than"             : "The %s field must contain a number less than %s.",
        "greater_than"          : "The %s field must contain a number greater than %s.",
        
        "invalid"               : "The email/password combination entered is invalid.",
        "access"                : "You do not have access to that resource.",
        "unathenticated"        : "You must login first.",

        "no_quiz"               : "Please enter the basic quiz information before continuing.",
        "quiz_not_available"    : "The quiz you are trying to access is not currently available.",
        "quiz_not_found"        : "The quiz you are trying to access was not found.",
        "image_err"             : "Unable to upload the selected image file.",
        "image_err_size"        : "The file you selected exceeds the maximum allowed height/width.",
        "no_questions"          : "You must have at least one question.",
        "data_error"            : "Failed to load the requested data.",
        "connect_vendor_error"  : "Unable to connect to your external account. The credentials provided may not be valid.",
        "login_restricted"      : "This account has been disabled. Please contact support for more information.",
        "create_admin"          : "Failed to create administrator account.",
        "image_wrong_size"      : "The file you selected doesn't match the required dimensions.",
        "failed_to_find_user"   : "This email address was not found in our system.",
        "leadType_not_selected" : "Please select a lead capture type or disable lead capture.",

        "publish_no_outcomes"         : "Please add outcomes to your quiz before publishing.",
        "publish_no_questions"        : "Please add questions to your quiz before publishing.",
        "publish_question_no_mapping" : "One or more questions have no mapped outcomes.",

        "no_orig_pass"          : "Please enter your original password",
        "no_new_pass"           : "Please enter your new password",
        "no_repeat_pass"        : "Please re-enter your new password",
        "no_pass_match"         : "The new password fields do not match",
        "invalid_orig_pass"     : "The original password provided is not correct"

    },
    s: function(key, value) {
      return this.language[key].replace('%s', value);
    },
    t: function(key) {
      return this.language[key];
    }
};