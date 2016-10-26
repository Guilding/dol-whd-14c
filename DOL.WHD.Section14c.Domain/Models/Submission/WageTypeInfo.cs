﻿using System;
using System.ComponentModel.DataAnnotations;

namespace DOL.WHD.Section14c.Domain.Models.Submission
{
    public class WageTypeInfo : BaseEntity
    {
        public WageTypeInfo()
        {
            Id = Guid.NewGuid();
        }

        public Guid Id { get; set; }

        [Required]
        public int NumWorkers { get; set; }

        [Required]
        public string JobName { get; set; }

        [Required]
        public string JobDescription { get; set; }

        [Required]
        public int PrevailingWageMethodId { get; set; }
        public virtual Response PrevailingWageMethod { get; set; }

        public PrevailingWageSurveyInfo MostRecentPrevailingWageSurvey { get; set; }

        public AlternateWageData AlternateWageData { get; set; }

        public Guid? SCAWageDeterminationId { get; set; }
        public Attachment SCAWageDetermination { get; set; }

        // Documentation
        [Required]
        public Guid? AttachmentId { get; set; }
        public Attachment Attachment { get; set; }
    }
}
