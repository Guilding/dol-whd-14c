﻿using DOL.WHD.Section14c.Domain.Models.Submission;
using System;
using System.ComponentModel.DataAnnotations;

namespace DOL.WHD.Section14c.Domain.Models.Identity
{
    public sealed class ApplicationSave : BaseEntity
    {
        public ApplicationSave()
        {
            ApplicationId = ApplicationId ?? Guid.NewGuid().ToString();
        }

        [Key]
        public string EIN { get; set; }

        public string ApplicationId { get; set; }

        public Employer Employer { get; set; }

        [Required]
        public string ApplicationState { get; set; }
    }
}
